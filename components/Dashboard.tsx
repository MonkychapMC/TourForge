


import React, { useState } from 'react';
import { TourPackage, TourRoute, UserSettings } from '../types';
import { View } from '../App';
import { formatCurrency } from '../utils/currency';
import { PlusIcon, EditIcon, TrashIcon, ShareIcon, CompassIcon } from './icons';
import { useI18n } from '../hooks/useI18n';

interface DashboardProps {
  tourData: {
    packages: TourPackage[];
    routes: TourRoute[];
    settings: UserSettings;
    deletePackage: (id: string) => void;
    deleteRoute: (id: string) => void;
  };
  setView: (view: View) => void;
  initialTab?: 'packages' | 'routes';
  isHomePage?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ tourData, setView, initialTab = 'packages', isHomePage = false }) => {
  const { packages, routes, settings, deletePackage, deleteRoute } = tourData;
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState(initialTab);

  const calculateRouteCost = (route: TourRoute) => {
    const { quantities, personCount, isPhotographerOptional, photographerCost } = route;
    const { unitCosts } = settings;

    if (!unitCosts) return 0;

    // Define which costs are per person vs. per group
    const perPersonCostKeys: (keyof typeof quantities)[] = ['medical', 'logistics'];
    const groupCostKeys: (keyof typeof quantities)[] = ['guide', 'transport'];

    // Calculate the total cost of all per-person items for one person
    const totalPerPersonCost = perPersonCostKeys.reduce((total, key) => {
        // Use || 0 as a safeguard in case a unit cost is not defined
        return total + (quantities[key] * (unitCosts[key] || 0));
    }, 0);

    // Calculate the total cost of all group-wide items
    const totalGroupCost = groupCostKeys.reduce((total, key) => {
        return total + (quantities[key] * (unitCosts[key] || 0));
    }, 0);
    
    const photographerTotalCost = isPhotographerOptional ? 0 : photographerCost;
    
    // Final cost is group costs + photographer + (total per-person cost * number of people)
    const totalCost = totalGroupCost + photographerTotalCost + (totalPerPersonCost * personCount);

    return totalCost;
  };

  const calculatePackagePrice = (pkg: TourPackage) => {
    const routeCosts = pkg.routeIds.reduce((total, routeId) => {
      const route = routes.find(r => r.id === routeId);
      return total + (route ? calculateRouteCost(route) : 0);
    }, 0);
    const baseCost = (pkg.costs.transport + pkg.costs.lodging + pkg.costs.services) * (pkg.personCount || 1) + routeCosts;
    return baseCost * (1 + settings.profitMargin / 100);
  };

  const handleShare = async (item: TourPackage | TourRoute, price: number) => {
    const shareData = {
      title: item.name,
      text: `${item.name}\n${item.description}\n\nPrice: ${formatCurrency(price, 'USD')}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        alert(t('shareFallback'));
      }
    } catch (error) {
      console.error('Error sharing:', error);
      await navigator.clipboard.writeText(shareData.text);
      alert(t('shareFallback'));
    }
  };
  
  if (isHomePage && packages.length === 0 && routes.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{minHeight: 'calc(100vh - 200px)'}}>
        <div className="text-center p-8 sm:p-12 bg-[var(--color-card)] rounded-lg shadow-xl border border-[var(--color-border)] max-w-2xl mx-auto">
          <CompassIcon className="w-16 h-16 text-[var(--color-primary)] mx-auto mb-4 animate-pulse" />
          <h2 className="text-3xl font-bold font-serif text-[var(--color-text-primary)] mb-4">{t('welcomeTitle')}</h2>
          <p className="text-[var(--color-text-secondary)] mb-8 leading-relaxed">{t('welcomeMessage')}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => setView({ type: 'CREATE_ROUTE' })} className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--color-primary-hover)] flex items-center justify-center gap-2 transition-transform transform hover:scale-105">
              <PlusIcon /> {t('startWithRoute')}
            </button>
            <button onClick={() => setView({ type: 'CREATE_PACKAGE' })} className="bg-[var(--color-accent)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--color-accent-hover)] flex items-center justify-center gap-2 transition-transform transform hover:scale-105">
              <PlusIcon /> {t('startWithPackage')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const EmptyStateWithCTA: React.FC<{ message: string; buttonText: string; onClick: () => void; }> = ({ message, buttonText, onClick }) => (
    <div className="col-span-full text-center py-16 px-4 bg-[var(--color-card)] rounded-lg border-2 border-dashed border-[var(--color-border)]">
        <p className="text-[var(--color-text-secondary)] mb-6">{message}</p>
        <button onClick={onClick} className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--color-primary-hover)] flex items-center justify-center gap-2 transition-transform transform hover:scale-105 mx-auto">
            <PlusIcon /> {buttonText}
        </button>
    </div>
  );

  const tabButtonStyles = (tabName: 'packages' | 'routes') =>
    `px-4 py-2 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 ${
      activeTab === tabName
        ? 'bg-[var(--color-primary)] text-white shadow-md'
        : 'text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5'
    }`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex space-x-2 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
          <button onClick={() => setActiveTab('packages')} className={tabButtonStyles('packages')}>
            {t('packages')}
          </button>
          <button onClick={() => setActiveTab('routes')} className={tabButtonStyles('routes')}>
            {t('routes')}
          </button>
        </div>
        
         {activeTab === 'packages' && packages.length > 0 && (
             <button onClick={() => setView({ type: 'CREATE_PACKAGE' })} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[var(--color-primary-hover)] flex items-center gap-2 transition-colors duration-200">
                <PlusIcon /> {t('newPackage')}
            </button>
         )}
         {activeTab === 'routes' && routes.length > 0 && (
            <button onClick={() => setView({ type: 'CREATE_ROUTE' })} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[var(--color-primary-hover)] flex items-center gap-2 transition-colors duration-200">
                <PlusIcon /> {t('newRoute')}
            </button>
         )}
      </div>

      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.length === 0 ? (
            <EmptyStateWithCTA 
              message={t('noPackages')} 
              buttonText={t('newPackage')}
              onClick={() => setView({ type: 'CREATE_PACKAGE' })} 
            />
          ) : (
            packages.map(pkg => {
              const totalPrice = calculatePackagePrice(pkg);
              const pricePerPerson = pkg.personCount > 0 ? totalPrice / pkg.personCount : totalPrice;
              return (
              <div key={pkg.id} className="bg-[var(--color-card)] rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] flex flex-col border border-[var(--color-border)]">
                {pkg.imageUrl && <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-40 object-cover" />}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-lg text-[var(--color-text-primary)] font-serif">{pkg.name}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1 flex-grow">{pkg.description}</p>
                   <p className="text-sm text-[var(--color-text-secondary)] mt-2">{t('people', {count: pkg.personCount})}</p>
                  <div className="mt-2">
                    <p className="font-semibold text-[var(--color-text-primary)]">{t('priceVes')}: <span className="text-[var(--color-accent)]">{formatCurrency(totalPrice * settings.exchangeRate, 'VES')}</span></p>
                    <p className="font-semibold text-[var(--color-text-primary)]">{t('priceUsd')}: <span className="text-[var(--color-accent)]">{formatCurrency(totalPrice, 'USD')}</span></p>
                    {pkg.personCount > 1 && <p className="text-xs text-[var(--color-text-secondary)]">{formatCurrency(pricePerPerson, 'USD')} {t('perPerson')}</p>}
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button onClick={() => handleShare(pkg, totalPrice)} className="p-2 text-[var(--color-text-secondary)] hover:text-green-500 transition-colors" aria-label={t('share')}><ShareIcon /></button>
                    <button onClick={() => setView({ type: 'EDIT_PACKAGE', packageId: pkg.id })} className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors" aria-label={t('edit')}><EditIcon /></button>
                    <button onClick={() => deletePackage(pkg.id)} className="p-2 text-[var(--color-text-secondary)] hover:text-red-500 transition-colors" aria-label={t('delete')}><TrashIcon /></button>
                  </div>
                </div>
              </div>
            )})
          )}
        </div>
      )}

      {activeTab === 'routes' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.length === 0 ? (
                <EmptyStateWithCTA
                  message={t('noRoutes')}
                  buttonText={t('newRoute')}
                  onClick={() => setView({ type: 'CREATE_ROUTE' })}
                />
            ) : (
                routes.map(route => {
                    const totalCost = calculateRouteCost(route);
                    const costPerPerson = route.personCount > 0 ? totalCost / route.personCount : totalCost;
                    return (
                        <div key={route.id} className="bg-[var(--color-card)] rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] flex flex-col border border-[var(--color-border)]">
                            <div className="p-4 flex flex-col flex-grow">
                                <h3 className="font-bold text-lg text-[var(--color-text-primary)] font-serif">{route.name}</h3>
                                <p className="text-sm text-[var(--color-text-secondary)] mt-1 flex-grow">{route.description}</p>
                                <div className="mt-2 text-sm text-[var(--color-text-secondary)] grid grid-cols-2 gap-x-4 gap-y-1">
                                    <span>{t('people', {count: route.personCount})}</span>
                                    <span>{route.stops.length} {t('stops')}</span>
                                    <span>{route.kilometers.toFixed(1)} km</span>
                                    <span>{route.durationHours.toFixed(1)} {t('hours')}</span>
                                </div>
                                <div className="mt-2">
                                    <p className="font-semibold text-[var(--color-text-primary)]">{t('costUsd')}: <span className="text-[var(--color-accent)]">{formatCurrency(totalCost, 'USD')}</span></p>
                                    {route.personCount > 1 && <p className="text-xs text-[var(--color-text-secondary)]">{formatCurrency(costPerPerson, 'USD')} {t('perPerson')}</p>}
                                </div>
                                <div className="mt-4 flex justify-end gap-2">
                                    <button onClick={() => setView({ type: 'EDIT_ROUTE', routeId: route.id })} className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors" aria-label={t('edit')}><EditIcon /></button>
                                    <button onClick={() => deleteRoute(route.id)} className="p-2 text-[var(--color-text-secondary)] hover:text-red-500 transition-colors" aria-label={t('delete')}><TrashIcon /></button>
                                </div>
                            </div>
                        </div>
                    )
                })
            )}
         </div>
      )}
    </div>
  );
};

export default Dashboard;
