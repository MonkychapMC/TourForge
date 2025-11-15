

import React from 'react';
import { View } from '../App';
import { useI18n } from '../hooks/useI18n';
import { SettingsIcon, DashboardIcon, PackageIcon, RouteIcon } from './icons';

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

    const isViewActive = (viewType: View['type']) => view.type === viewType || 
        (viewType === 'PACKAGES_LIST' && (view.type === 'CREATE_PACKAGE' || view.type === 'EDIT_PACKAGE')) ||
        (viewType === 'ROUTES_LIST' && (view.type === 'CREATE_ROUTE' || view.type === 'EDIT_ROUTE'));

    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-lg">
            <button
                onClick={() => setView({ type: 'DASHBOARD' })}
                className="group flex items-center justify-start gap-0 hover:gap-3 p-4 h-[65px] border-b border-slate-700 w-full text-left transition-all duration-300 hover:bg-slate-800"
                aria-label="Go to dashboard"
            >
                <img 
                    src="data:image/png;base64,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"
                    alt="TourForge Logo"
                    className="w-12 h-12 transition-transform duration-300 group-hover:rotate-[360deg]"
                />
                <h1 className="text-xl font-bold font-serif opacity-0 group-hover:opacity-100 transition-opacity duration-300">TourForge</h1>
            </button>
            <nav className="flex-1 px-4 py-6 space-y-2">
                <NavLink 
                    icon={<DashboardIcon className="w-5 h-5" />} 
                    label={t('dashboard')} 
                    isActive={isViewActive('DASHBOARD')} 
                    onClick={() => setView({ type: 'DASHBOARD' })} 
                />
                <NavLink 
                    icon={<PackageIcon className="w-5 h-5" />} 
                    label={t('packages')} 
                    isActive={isViewActive('PACKAGES_LIST')} 
                    onClick={() => setView({ type: 'PACKAGES_LIST' })} 
                />
                <NavLink 
                    icon={<RouteIcon className="w-5 h-5" />} 
                    label={t('routes')} 
                    isActive={isViewActive('ROUTES_LIST')} 
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