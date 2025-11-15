import React, { useState, useEffect } from 'react';
import { TourPackage, TourRoute, UserSettings } from '../types';
import { generateDescription, generatePromotionalImage, suggestTitle, editImageWithPrompt } from '../services/geminiService';
import { LoadingSpinner } from './icons';
import { useI18n } from '../hooks/useI18n';
import { generateShortId } from '../utils/shortId';

interface PackageBuilderProps {
  existingPackage?: TourPackage;
  allRoutes: TourRoute[];
  onSave: (pkg: TourPackage) => void;
  onCancel: () => void;
  settings: UserSettings;
}

const PackageBuilder: React.FC<PackageBuilderProps> = ({ existingPackage, allRoutes, onSave, onCancel }) => {
  const { t, language } = useI18n();
  const [pkg, setPkg] = useState<Omit<TourPackage, 'id'>>({
    name: '',
    description: '',
    imageUrl: '',
    personCount: 1,
    costs: { transport: 0, lodging: 0, services: 0 },
    routeIds: [],
  });
  const [isGenerating, setIsGenerating] = useState({ title: false, description: false, image: false, imageEdit: false });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageEditPrompt, setImageEditPrompt] = useState<string>('');

  useEffect(() => {
    if (existingPackage) {
      setPkg(existingPackage);
    }
  }, [existingPackage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name in pkg.costs) {
      setPkg(prev => ({ ...prev, costs: { ...prev.costs, [name]: parseFloat(value) || 0 } }));
    } else if (name === 'personCount') {
       setPkg(prev => ({ ...prev, [name]: parseInt(value, 10) || 1 }));
    } else {
      setPkg(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRouteChange = (routeId: string) => {
    setPkg(prev => {
      const newRouteIds = prev.routeIds.includes(routeId)
        ? prev.routeIds.filter(id => id !== routeId)
        : [...prev.routeIds, routeId];
      return { ...prev, routeIds: newRouteIds };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPackage: TourPackage = { ...pkg, id: existingPackage?.id || generateShortId() };
    onSave(finalPackage);
    onCancel();
  };

  const handleSuggestTitle = async () => {
    if (!pkg.description) return;
    setIsGenerating(p => ({ ...p, title: true }));
    const title = await suggestTitle(pkg.description, language);
    setPkg(p => ({ ...p, name: title }));
    setIsGenerating(p => ({ ...p, title: false }));
  };

  const handleGenerateDescription = async () => {
    if (!pkg.name) return;
    setIsGenerating(p => ({ ...p, description: true }));
    const description = await generateDescription(pkg.name, language);
    setPkg(p => ({ ...p, description }));
    setIsGenerating(p => ({ ...p, description: false }));
  };
  
  const handleGenerateImage = async () => {
    const prompt = pkg.description || pkg.name;
    if (!prompt) return;
    setIsGenerating(p => ({ ...p, image: true }));
    const url = await generatePromotionalImage(prompt);
    if(url) {
      setPkg(p => ({ ...p, imageUrl: url }));
    }
    setIsGenerating(p => ({ ...p, image: false }));
  };

   const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
         setPkg(p => ({ ...p, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImage = async () => {
    if(!imageFile || !imageEditPrompt) return;
    setIsGenerating(p => ({...p, imageEdit: true}));
    const newImageUrl = await editImageWithPrompt(imageFile, imageEditPrompt);
    if (newImageUrl) {
        setPkg(p => ({...p, imageUrl: newImageUrl}));
    }
    setIsGenerating(p => ({...p, imageEdit: false}));
  }
  
  const inputStyles = "mt-1 block w-full rounded-md bg-white/50 dark:bg-black/20 border-[var(--color-border)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]";
  const labelStyles = "block text-sm font-medium text-[var(--color-text-secondary)]";
  const cardStyles = "bg-[var(--color-card)] p-6 rounded-lg shadow-md border border-[var(--color-border)]";
  const aiButtonStyles = "flex items-center justify-center bg-stone-200 dark:bg-slate-700 text-[var(--color-primary)] px-3 rounded-md hover:bg-stone-300 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors";

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Info */}
        <div className={cardStyles + " space-y-6"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelStyles}>{t('packageName')}</label>
                    <div className="flex gap-2">
                        <input type="text" name="name" value={pkg.name} onChange={handleChange} className={inputStyles} required />
                        <button type="button" onClick={handleSuggestTitle} disabled={isGenerating.title || !pkg.description} className={aiButtonStyles} aria-label={t('suggestTitle')}>
                            {isGenerating.title ? <LoadingSpinner /> : 'AI'}
                        </button>
                    </div>
                </div>
                <div>
                    <label className={labelStyles}>{t('personCount')}</label>
                    <input type="number" name="personCount" value={pkg.personCount} onChange={handleChange} min="1" className={inputStyles} />
                </div>
                <div className="col-span-1 md:col-span-2">
                    <label className={labelStyles}>{t('description')}</label>
                    <div className="flex gap-2">
                        <textarea name="description" value={pkg.description} onChange={handleChange} rows={3} className={inputStyles}></textarea>
                        <button type="button" onClick={handleGenerateDescription} disabled={isGenerating.description || !pkg.name} className={aiButtonStyles} aria-label={t('generateDescription')}>
                            {isGenerating.description ? <LoadingSpinner /> : 'AI'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Image Generation & Editing */}
        <div className={cardStyles}>
            <label className={labelStyles}>{t('promoImage')}</label>
            <div className="mt-2 p-4 border-2 border-dashed border-[var(--color-border)] rounded-lg">
                {pkg.imageUrl && <img src={pkg.imageUrl} alt="Package" className="w-full h-auto max-h-60 object-contain rounded-md mb-4" />}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button type="button" onClick={handleGenerateImage} disabled={isGenerating.image} className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent)] text-white px-4 py-2 rounded-md hover:bg-[var(--color-accent-hover)] disabled:opacity-70 transition-colors">
                        {isGenerating.image ? <LoadingSpinner /> : t('generateWithAi')}
                    </button>
                    <div className="relative w-full">
                        <input type="file" accept="image/*" onChange={handleImageFileChange} id="imageUpload" className="absolute w-0 h-0 opacity-0" />
                        <label htmlFor="imageUpload" className="cursor-pointer text-center w-full block bg-stone-500 text-white px-4 py-2 rounded-md hover:bg-stone-600 transition-colors">{t('uploadImage')}</label>
                    </div>
                </div>
                 {imageFile && (
                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <input type="text" placeholder={t('editImagePlaceholder')} value={imageEditPrompt} onChange={(e) => setImageEditPrompt(e.target.value)} className={inputStyles + " flex-grow"} />
                        <button type="button" onClick={handleEditImage} disabled={isGenerating.imageEdit || !imageEditPrompt} className="flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-md hover:bg-[var(--color-primary-hover)] disabled:opacity-70 transition-colors">
                           {isGenerating.imageEdit ? <LoadingSpinner /> : t('editWithAi')}
                        </button>
                    </div>
                 )}
            </div>
        </div>

        {/* Costs */}
        <div className={cardStyles}>
          <h3 className="text-lg font-medium text-[var(--color-text-primary)] font-serif">{t('costsPerPerson')} (USD)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div>
                <label className={labelStyles}>{t('transport')}</label>
                <input type="number" name="transport" value={pkg.costs.transport} className={inputStyles} onChange={handleChange} />
            </div>
            <div>
                <label className={labelStyles}>{t('lodging')}</label>
                <input type="number" name="lodging" value={pkg.costs.lodging} onChange={handleChange} className={inputStyles} />
            </div>
            <div>
                <label className={labelStyles}>{t('services')}</label>
                <input type="number" name="services" value={pkg.costs.services} onChange={handleChange} className={inputStyles} />
            </div>
          </div>
        </div>

        {/* Routes */}
        <div className={cardStyles}>
            <h3 className="text-lg font-medium text-[var(--color-text-primary)] font-serif">{t('addRoutes')}</h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allRoutes.length > 0 ? allRoutes.map(route => (
                    <div key={route.id} className="flex items-center">
                    <input type="checkbox" id={`route-${route.id}`} checked={pkg.routeIds.includes(route.id)} onChange={() => handleRouteChange(route.id)} className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                    <label htmlFor={`route-${route.id}`} className="ml-3 block text-sm text-[var(--color-text-primary)]">{route.name}</label>
                    </div>
                )) : <p className="text-[var(--color-text-secondary)]">{t('noRoutesAvailable')}</p>}
            </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button type="button" onClick={onCancel} className="bg-stone-200 text-stone-800 px-6 py-2 rounded-lg font-semibold hover:bg-stone-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors">{t('cancel')}</button>
          <button type="submit" className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[var(--color-primary-hover)] transition-colors">{t('savePackage')}</button>
        </div>
      </form>
    </div>
  );
};

export default PackageBuilder;