
import React from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-[var(--color-card)] shadow-sm p-4 border-b border-[var(--color-border)] flex items-center">
      <h1 className="text-xl font-bold text-[var(--color-text-primary)] font-serif">{title}</h1>
    </header>
  );
};

export default Header;
