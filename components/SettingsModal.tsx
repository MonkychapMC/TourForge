

import React, { useState } from 'react';
import { UserSettings, Language, Theme } from '../types';
import { useI18n } from '../hooks/useI18n';

interface SettingsModalProps {
  settings: UserSettings;
  onSave: (newSettings: Partial<UserSettings>) => void;
  onClose: () => void;
}

const APP_VERSION = '1.1.0';

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
  const { t } = useI18n();
  const [exchangeRate, setExchangeRate] = useState(settings.exchangeRate.toString());
  const [profitMargin, setProfitMargin] = useState(settings.profitMargin.toString());
  const [language, setLanguage] = useState<Language>(settings.language);
  const [theme, setTheme] = useState<Theme>(settings.theme);
  const [unitCosts, setUnitCosts] = useState(settings.unitCosts || { guide: 150, medical: 20, transport: 200, logistics: 15 });
  
  const inputStyles = "mt-1 block w-full rounded-md bg-white/50 dark:bg-black/20 border-[var(--color-border)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]";
  const labelStyles = "block text-sm font-medium text-[var(--color-text-secondary)]";

  const languages: { code: Language; name: string; countryCode: string }[] = [
    { code: 'en', name: 'English', countryCode: 'gb' },
    { code: 'es', name: 'Español', countryCode: 'es' },
    { code: 'fr', name: 'Français', countryCode: 'fr' },
    { code: 'pt', name: 'Português', countryCode: 'pt' },
  ];

  const handleUnitCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUnitCosts(prev => ({...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSave = () => {
    onSave({
      exchangeRate: parseFloat(exchangeRate) || 0,
      profitMargin: parseFloat(profitMargin) || 0,
      language,
      theme,
      unitCosts,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--color-card)] rounded-lg shadow-xl p-8 w-full max-w-md m-4 overflow-y-auto max-h-[90vh] border border-[var(--color-border)]">
        <h2 className="text-2xl font-bold mb-6 text-[var(--color-text-primary)] font-serif">{t('settings')}</h2>
        <div className="space-y-6">
          <div>
            <label className={labelStyles}>{t('language')}</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`flex items-center justify-center gap-2 p-2 rounded-md border text-sm transition-colors ${
                    language === lang.code
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                      : 'bg-transparent border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <img src={`https://flagcdn.com/w20/${lang.countryCode}.png`} width="20" height="15" alt={lang.name} />
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelStyles}>{t('theme')}</label>
            <div className="mt-2 flex items-center justify-center p-1 rounded-full bg-black/5 dark:bg-white/5">
              <button
                onClick={() => setTheme('light')}
                className={`w-full py-1.5 text-sm rounded-full transition-colors ${theme === 'light' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
              >{t('light')}</button>
              <button
                onClick={() => setTheme('dark')}
                className={`w-full py-1.5 text-sm rounded-full transition-colors ${theme === 'dark' ? 'bg-slate-900 text-white shadow' : 'text-slate-400'}`}
              >{t('dark')}</button>
            </div>
          </div>
          <div>
            <label htmlFor="exchangeRate" className={labelStyles}>{t('exchangeRate')}</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-[var(--color-text-secondary)] sm:text-sm">$</span>
                </div>
                <input
                    type="number"
                    id="exchangeRate"
                    step="any"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(e.target.value)}
                    className={inputStyles + " pl-7 pr-12"}
                    placeholder="0.00"
                />
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-[var(--color-text-secondary)] sm:text-sm" id="price-currency">VES</span>
                </div>
            </div>
          </div>
          <div>
            <label htmlFor="profitMargin" className={labelStyles}>{t('profitMargin')}</label>
             <div className="mt-1 relative rounded-md shadow-sm">
                <input
                    type="number"
                    id="profitMargin"
                    step="any"
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(e.target.value)}
                    className={inputStyles + " pr-7"}
                    placeholder="25"
                />
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-[var(--color-text-secondary)] sm:text-sm">%</span>
                </div>
            </div>
          </div>

          <fieldset className="border p-4 rounded-md border-[var(--color-border)]">
            <legend className="text-lg font-medium text-[var(--color-text-primary)] font-serif px-2">{t('unitCosts')}</legend>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                  <label className={labelStyles}>{t('guideCost')}</label>
                  <input type="number" name="guide" value={unitCosts.guide} onChange={handleUnitCostChange} className={inputStyles} />
              </div>
              <div>
                  <label className={labelStyles}>{t('medicalCost')}</label>
                  <input type="number" name="medical" value={unitCosts.medical} onChange={handleUnitCostChange} className={inputStyles} />
              </div>
              <div>
                  <label className={labelStyles}>{t('transportCost')}</label>
                  <input type="number" name="transport" value={unitCosts.transport} onChange={handleUnitCostChange} className={inputStyles} />
              </div>
              <div>
                  <label className={labelStyles}>{t('logisticsCost')}</label>
                  <input type="number" name="logistics" value={unitCosts.logistics} onChange={handleUnitCostChange} className={inputStyles} />
              </div>
            </div>
          </fieldset>
        </div>
        <div className="text-center text-xs text-[var(--color-text-secondary)] mt-6">
          {t('appVersion')}: {APP_VERSION}
        </div>
        <div className="mt-4 flex justify-end gap-4">
          <button onClick={onClose} className="bg-stone-200 text-stone-800 px-4 py-2 rounded-lg font-semibold hover:bg-stone-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors">
            {t('cancel')}
          </button>
          <button onClick={handleSave} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[var(--color-primary-hover)] transition-colors">
            {t('saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;