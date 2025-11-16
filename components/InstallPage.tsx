import React, { useState, useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';
import { DesktopIcon, OfflineIcon, SpeedIcon, TourForgeLogo } from './icons';

interface InstallPageProps {
  installPrompt: any | null;
  onInstallClick: () => void;
}

const InstallPage: React.FC<InstallPageProps> = ({ installPrompt, onInstallClick }) => {
  const { t } = useI18n();
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    setCanInstall(!!installPrompt);
  }, [installPrompt]);

  const cardStyles = "bg-[var(--color-card)] p-6 sm:p-8 rounded-lg shadow-xl border border-[var(--color-border)] max-w-3xl mx-auto text-center";
  
  return (
    <div className={cardStyles}>
        <TourForgeLogo className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4" />
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[var(--color-text-primary)] mb-4">{t('installAppTitle')}</h2>

        {isInstalled ? (
            <p className="text-[var(--color-text-secondary)] mb-8 leading-relaxed">{t('appAlreadyInstalled')}</p>
        ) : (
            <>
                <p className="text-[var(--color-text-secondary)] mb-8 leading-relaxed max-w-xl mx-auto">{t('installAppBenefits')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 text-left">
                    {/* Benefit Cards */}
                    <div className="flex items-center gap-4">
                        <DesktopIcon className="w-10 h-10 text-[var(--color-primary)] flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold">{t('installBenefitDesktopTitle')}</h4>
                            <p className="text-sm text-[var(--color-text-secondary)]">{t('installBenefitDesktopText')}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <OfflineIcon className="w-10 h-10 text-[var(--color-primary)] flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold">{t('installBenefitOfflineTitle')}</h4>
                            <p className="text-sm text-[var(--color-text-secondary)]">{t('installBenefitOfflineText')}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <SpeedIcon className="w-10 h-10 text-[var(--color-primary)] flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold">{t('installBenefitSpeedTitle')}</h4>
                            <p className="text-sm text-[var(--color-text-secondary)]">{t('installBenefitSpeedText')}</p>
                        </div>
                    </div>
                </div>

                {canInstall ? (
                    <button onClick={onInstallClick} className="bg-[var(--color-accent)] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[var(--color-accent-hover)] flex items-center justify-center gap-2 transition-transform transform hover:scale-105 mx-auto text-lg">
                        {t('installNow')}
                    </button>
                ) : (
                    <div className="p-4 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 rounded-lg text-yellow-800 dark:text-yellow-200">
                        <p>{t('installNotSupported')}</p>
                    </div>
                )}
            </>
        )}
    </div>
  );
};

export default InstallPage;
