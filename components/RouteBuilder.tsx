import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TourRoute, TourStop, UserSettings } from '../types';
import { findPointsOfInterest, calculateRouteDetails } from '../services/geminiService';
import { PlusIcon, TrashIcon, LoadingSpinner } from './icons';
import { useI18n } from '../hooks/useI18n';
import { generateShortId } from '../utils/shortId';

interface RouteBuilderProps {
  existingRoute?: TourRoute;
  onSave: (route: TourRoute) => void;
  onCancel: () => void;
  settings: UserSettings;
}

const RouteBuilder: React.FC<RouteBuilderProps> = ({ existingRoute, onSave, onCancel }) => {
  const { t } = useI18n();
  const [route, setRoute] = useState<Omit<TourRoute, 'id'>>({
    name: '',
    description: '',
    stops: [],
    kilometers: 0,
    durationHours: 0,
    personCount: 1,
    quantities: {
      guide: 1,
      medical: 1,
      transport: 1,
      logistics: 1,
    },
    photographerCost: 0,
    isPhotographerOptional: false
  });
  const [poiQuery, setPoiQuery] = useState('');
  const [isFindingPois, setIsFindingPois] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [poiSuggestions, setPoiSuggestions] = useState('');
  const [errors, setErrors] = useState<{ name?: string; stops?: { [index: number]: string } }>({});


  useEffect(() => {
    if (existingRoute) {
      setRoute(existingRoute);
    }
  }, [existingRoute]);

  const stopNamesJson = useMemo(() => JSON.stringify(route.stops.map(s => s.name).filter(Boolean)), [route.stops]);

  const handleAutoCalculation = useCallback(async () => {
    const stopNames = JSON.parse(stopNamesJson);

    if (stopNames.length < 2 || route.personCount <= 0) {
      return;
    }

    setIsCalculating(true);
    try {
      const result = await calculateRouteDetails(stopNames, route.personCount);

      if (result) {
        setRoute(prev => ({
          ...prev,
          kilometers: result.kilometers,
          durationHours: result.durationHours,
          quantities: result.quantities,
        }));
      }
    } catch (error) {
        console.error("Error auto-calculating route details:", error);
    } finally {
      setIsCalculating(false);
    }
  }, [route.personCount, stopNamesJson]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleAutoCalculation();
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timer);
  }, [handleAutoCalculation]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
     if (name === 'name' && value.trim()) {
        setErrors(prev => ({ ...prev, name: undefined }));
    }
    if (name in route.quantities) {
      setRoute(prev => ({ ...prev, quantities: { ...prev.quantities, [name]: Math.max(0, parseInt(value, 10) || 0) } }));
    } else if (name === 'personCount') {
       setRoute(prev => ({ ...prev, [name]: Math.max(1, parseInt(value, 10) || 1) }));
    } else if (name === 'kilometers' || name === 'durationHours' || name === 'photographerCost') {
      setRoute(prev => ({...prev, [name]: Math.max(0, parseFloat(value) || 0)}));
    } else {
      setRoute(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoute(prev => ({ ...prev, [e.target.name]: e.target.checked }));
  };
  
  const handleStopChange = (index: number, field: keyof TourStop, value: string) => {
    const newStops = [...route.stops];
    newStops[index] = { ...newStops[index], [field]: value };
    setRoute(prev => ({...prev, stops: newStops}));

     if (field === 'name' && value.trim() && errors.stops?.[index]) {
        setErrors(prev => {
            const newStopErrors = {...(prev.stops || {})};
            delete newStopErrors[index];
            return {...prev, stops: newStopErrors};
        });
    }
  };

  const addStop = () => {
    setRoute(prev => ({ ...prev, stops: [...prev.stops, { id: generateShortId(), name: '', description: '' }] }));
  };

  const removeStop = (index: number) => {
    setRoute(prev => ({ ...prev, stops: prev.stops.filter((_, i) => i !== index) }));
  };

  const handleFindPois = async () => {
    if (!poiQuery) return;
    setIsFindingPois(true);
    setPoiSuggestions('');
    const suggestions = await findPointsOfInterest(poiQuery);
    setPoiSuggestions(suggestions);
    setIsFindingPois(false);
  };

  const validate = (): boolean => {
    const newErrors: { name?: string; stops?: { [index: number]: string } } = {};
    let isValid = true;

    if (!route.name.trim()) {
        newErrors.name = 'routeNameRequired';
        isValid = false;
    }

    const stopErrors: { [index: number]: string } = {};
    route.stops.forEach((stop, index) => {
        if (!stop.name.trim()) {
        stopErrors[index] = 'stopNameRequired';
        isValid = false;
        }
    });

    if (Object.keys(stopErrors).length > 0) {
        newErrors.stops = stopErrors;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
        return;
    }
    const finalRoute: TourRoute = { ...route, id: existingRoute?.id || generateShortId() };
    onSave(finalRoute);
    onCancel();
  };
  
  const inputStyles = "mt-1 block w-full rounded-md bg-white/50 dark:bg-black/20 border-[var(--color-border)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]";
  const labelStyles = "block text-sm font-medium text-[var(--color-text-secondary)]";
  const cardStyles = "bg-[var(--color-card)] p-6 rounded-lg shadow-md border border-[var(--color-border)]";
  
  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        <div className={cardStyles + " space-y-6"}>
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] font-serif"> {t('routeDetails')}</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className={labelStyles}>{t('routeName')}</label>
                    <input type="text" name="name" value={route.name} onChange={handleChange} className={inputStyles} required />
                     {errors.name && <p className="mt-1 text-sm text-red-500">{t(errors.name)}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className={labelStyles}>{t('description')}</label>
                    <textarea name="description" value={route.description} onChange={handleChange} rows={2} className={inputStyles}></textarea>
                </div>
                <div>
                  <label className={labelStyles}>{t('personCount')}</label>
                  <div className="relative">
                    <input type="number" name="personCount" value={route.personCount} onChange={handleChange} min="1" className={inputStyles} />
                    {isCalculating && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <LoadingSpinner className="h-5 w-5 text-[var(--color-primary)]" />
                        </div>
                    )}
                  </div>
                </div>
                <div>
                    <label className={labelStyles}>{t('kilometers')}</label>
                    <input type="number" name="kilometers" value={route.kilometers} onChange={handleChange} min="0" className={inputStyles} />
                </div>
                <div>
                     <label className={labelStyles}>{t('durationHours')}</label>
                    <input type="number" name="durationHours" value={route.durationHours} onChange={handleChange} min="0" className={inputStyles} />
                </div>
            </div>
        </div>
        
        <div className={cardStyles + " space-y-4"}>
          <h3 className="text-xl font-semibold text-[var(--color-text-primary)] font-serif">{t('resources')}</h3>
          <p className="text-sm text-[var(--color-text-secondary)] -mt-2">{t('resourcesDescription')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
                <label className={labelStyles}>{t('guideQuantity')}</label>
                <input type="number" name="guide" value={route.quantities.guide} onChange={handleChange} min="0" className={inputStyles} />
            </div>
            <div>
                <label className={labelStyles}>{t('medicalQuantity')}</label>
                <input type="number" name="medical" value={route.quantities.medical} onChange={handleChange} min="0" className={inputStyles} />
            </div>
            <div>
                <label className={labelStyles}>{t('transportQuantity')}</label>
                <input type="number" name="transport" value={route.quantities.transport} onChange={handleChange} min="0" className={inputStyles} />
            </div>
            <div>
                <label className={labelStyles}>{t('logisticsQuantity')}</label>
                <input type="number" name="logistics" value={route.quantities.logistics} onChange={handleChange} min="0" className={inputStyles} />
            </div>
            <div>
                <label className={labelStyles}>{t('photographerCost')}</label>
                <input type="number" name="photographerCost" value={route.photographerCost} onChange={handleChange} min="0" className={inputStyles} />
            </div>
          </div>
           <div className="pt-2 flex items-center">
            <input type="checkbox" id="isPhotographerOptional" name="isPhotographerOptional" checked={route.isPhotographerOptional} onChange={handleCheckboxChange} className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
            <label htmlFor="isPhotographerOptional" className="ml-2 block text-sm text-[var(--color-text-primary)]">{t('photographerOptional')}</label>
          </div>
        </div>

        <div className={cardStyles + " space-y-4"}>
          <h3 className="text-xl font-semibold text-[var(--color-text-primary)] font-serif">{t('aiStopSuggestions')}</h3>
          <div className="flex gap-2">
            <input type="text" value={poiQuery} onChange={(e) => setPoiQuery(e.target.value)} placeholder={t('poiPlaceholder')} className={inputStyles + " flex-grow"} />
            <button type="button" onClick={handleFindPois} disabled={isFindingPois} className="flex items-center justify-center bg-[var(--color-accent)] text-white px-4 py-2 rounded-md hover:bg-[var(--color-accent-hover)] disabled:opacity-70 transition-colors">
              {isFindingPois ? <LoadingSpinner /> : t('findStops')}
            </button>
          </div>
          {poiSuggestions && <div className="mt-4 p-4 bg-[var(--color-background)] rounded-md whitespace-pre-wrap font-mono text-sm text-[var(--color-text-secondary)]">{poiSuggestions}</div>}
        </div>

        <div className={cardStyles + " space-y-4"}>
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] font-serif">{t('stopsOnRoute')}</h3>
            <div className="space-y-4 pt-2">
                {route.stops.map((stop, index) => (
                <div key={stop.id} className="flex items-start gap-4 p-4 border border-[var(--color-border)] rounded-lg bg-black/5 dark:bg-white/5">
                    <span className="pt-2 text-lg font-bold text-[var(--color-text-secondary)]">{index + 1}.</span>
                    <div className="flex-grow space-y-2">
                        <input type="text" placeholder={t('stopName')} value={stop.name} onChange={(e) => handleStopChange(index, 'name', e.target.value)} className={inputStyles} />
                         {errors.stops?.[index] && <p className="mt-1 text-sm text-red-500">{t(errors.stops[index])}</p>}
                        <textarea placeholder={t('description')} value={stop.description} onChange={(e) => handleStopChange(index, 'description', e.target.value)} rows={2} className={inputStyles} />
                    </div>
                    <button type="button" onClick={() => removeStop(index)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" aria-label={t('removeStop')}><TrashIcon /></button>
                </div>
                ))}
            </div>
            <button type="button" onClick={addStop} className="mt-2 flex items-center gap-2 text-[var(--color-primary)] font-semibold hover:text-[var(--color-primary-hover)] transition-colors">
                <PlusIcon /> {t('addStop')}
            </button>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onCancel} className="bg-stone-200 text-stone-800 px-6 py-2 rounded-lg font-semibold hover:bg-stone-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors">{t('cancel')}</button>
          <button type="submit" className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[var(--color-primary-hover)] transition-colors">{t('saveRoute')}</button>
        </div>
      </form>
    </div>
  );
};

export default RouteBuilder;