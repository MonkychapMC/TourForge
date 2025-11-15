

import React from 'react';
import { View } from '../App';
import { useI18n } from '../hooks/useI18n';
import { SettingsIcon, DashboardIcon, CompassIcon, PackageIcon, RouteIcon } from './icons';

interface SidebarProps {
  view: View;
  setView: (view: View) => void;
  onSettingsClick: () => void;
}

const NavLink: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-[var(--color-primary)] text-white'
          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
);


const Sidebar: React.FC<SidebarProps> = ({ view, setView, onSettingsClick }) => {
    const { t, settings } = useI18n();

    const isHomeActive = view.type === 'DASHBOARD';
    const isPackagesActive = ['PACKAGES_LIST', 'CREATE_PACKAGE', 'EDIT_PACKAGE'].includes(view.type);
    const isRoutesActive = ['ROUTES_LIST', 'CREATE_ROUTE', 'EDIT_ROUTE'].includes(view.type);

    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-lg">
            <button
                onClick={() => setView({ type: 'DASHBOARD' })}
                className="group flex items-center justify-start p-4 h-[65px] border-b border-slate-700 w-full text-left transition-all duration-300 hover:bg-slate-800"
                aria-label="Go to dashboard"
            >
                <CompassIcon 
                    className="w-12 h-12 text-[var(--color-primary)] transition-transform duration-300 group-hover:rotate-[360deg]"
                />
                <h1 className="text-xl font-bold font-serif opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-2">TourForge</h1>
            </button>
            <nav className="flex-1 px-4 py-6 space-y-2">
                <NavLink 
                    icon={<DashboardIcon className="w-5 h-5" />} 
                    label={t('dashboard')} 
                    isActive={isHomeActive} 
                    onClick={() => setView({ type: 'DASHBOARD' })} 
                />
                <NavLink 
                    icon={<PackageIcon className="w-5 h-5" />} 
                    label={t('packages')} 
                    isActive={isPackagesActive} 
                    onClick={() => setView({ type: 'PACKAGES_LIST' })} 
                />
                <NavLink 
                    icon={<RouteIcon className="w-5 h-5" />} 
                    label={t('routes')} 
                    isActive={isRoutesActive} 
                    onClick={() => setView({ type: 'ROUTES_LIST' })} 
                />
            </nav>
            <div className="p-4 border-t border-slate-700">
                <p className="text-xs text-slate-400 mb-2">{t('userId')}:</p>
                <p className="text-xs font-mono text-slate-300 break-all">{settings.userId}</p>
                <button
                    onClick={onSettingsClick}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors bg-slate-700 hover:bg-slate-600 text-white"
                >
                    <SettingsIcon className="w-5 h-5" />
                    <span>{t('settings')}</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;