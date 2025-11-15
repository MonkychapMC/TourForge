

import React from 'react';
import { MenuIcon } from './icons';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  return (
    <header className="bg-[var(--color-card)] shadow-sm p-4 border-b border-[var(--color-border)] flex items-center gap-4">
      <button 
        onClick={onMenuClick} 
        className="md:hidden text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        aria-label="Open menu"
      >
        <MenuIcon className="w-6 h-6" />
      </button>
      <h1 className="text-xl font-bold text-[var(--color-text-primary)] font-serif">{title}</h1>
    </header>
  );
};

export default Header;