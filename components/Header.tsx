import React from 'react';
import { MenuIcon, InstallIcon } from './icons';
import { useI18n } from '../hooks/useI18n';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
  onInstallClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick, onInstallClick }) => {
  const { t } = useI18n();
  return (
    <header className="bg-[var(--color-card)] shadow-sm p-4 border-b border-[var(--color-border)] flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick} 
          className="md:hidden text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          aria-label="Open menu"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-[var(--color-text-primary)] font-serif">{title}</h1>
      </div>
      
      <button
        onClick={onInstallClick}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white"
        aria-label={t('installApp')}
      >
        <InstallIcon className="w-5 h-5" />
        <span className="hidden sm:inline">{t('installApp')}</span>
      </button>
    </header>
  );
};

export default Header;