import React from 'react';
import { View } from '../App';
import { useI18n } from '../hooks/useI18n';
import { SettingsIcon, DashboardIcon, TourForgeLogo, PackageIcon, RouteIcon, CloseIcon, InstallIcon } from './icons';

interface SidebarProps {
  view: View;
  setView: (view: View) => void;
  onSettingsClick: () => void;
  isOpen: boolean;
  onClose: () => void;
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


const Sidebar: React.FC<SidebarProps> = ({ view, setView, onSettingsClick, isOpen, onClose }) => {
    const { t, settings } = useI18n();

    const isHomeActive = view.type === 'DASHBOARD';
    const isPackagesActive = ['PACKAGES_LIST', 'CREATE_PACKAGE', 'EDIT_PACKAGE'].includes(view.type);
    const isRoutesActive = ['ROUTES_LIST', 'CREATE_ROUTE', 'EDIT_ROUTE'].includes(view.type);

    return (
        <>
            {/* Overlay for mobile */}
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            />
            
            <aside className={`w-64 bg-slate-800 text-white flex flex-col shadow-lg fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div
                    className="flex items-center justify-between p-4 h-[65px] border-b border-slate-700 w-full text-left"
                >
                    <button
                        onClick={() => { setView({ type: 'DASHBOARD' }); onClose(); }}
                        className="flex items-center gap-2"
                        aria-label="Go to dashboard"
                    >
                        <TourForgeLogo className="w-8 h-8" />
                        <h1 className="text-xl font-bold font-serif">TourForge</h1>
                    </button>
                    {/* Mobile close button */}
                    <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white" aria-label="Close menu">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <NavLink 
                        icon={<DashboardIcon className="w-5 h-5" />} 
                        label={t('dashboard')} 
                        isActive={isHomeActive} 
                        onClick={() => { setView({ type: 'DASHBOARD' }); onClose(); }} 
                    />
                    <NavLink 
                        icon={<PackageIcon className="w-5 h-5" />} 
                        label={t('packages')} 
                        isActive={isPackagesActive} 
                        onClick={() => { setView({ type: 'PACKAGES_LIST' }); onClose(); }} 
                    />
                    <NavLink 
                        icon={<RouteIcon className="w-5 h-5" />} 
                        label={t('routes')} 
                        isActive={isRoutesActive} 
                        onClick={() => { setView({ type: 'ROUTES_LIST' }); onClose(); }} 
                    />
                </nav>
                <div className="p-4 border-t border-slate-700 space-y-4">
                    <div>
                        <p className="text-xs text-slate-400 mb-2">{t('userId')}:</p>
                        <p className="text-xs font-mono text-slate-300 break-all">{settings.userId}</p>
                    </div>
                    <button
                        onClick={() => { setView({ type: 'INSTALL_APP' }); onClose(); }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors bg-slate-700 hover:bg-slate-600 text-white"
                    >
                        <InstallIcon className="w-5 h-5" />
                        <span>{t('installApp')}</span>
                    </button>
                    <button
                        onClick={() => { onSettingsClick(); onClose(); }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors bg-slate-700 hover:bg-slate-600 text-white"
                    >
                        <SettingsIcon className="w-5 h-5" />
                        <span>{t('settings')}</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;