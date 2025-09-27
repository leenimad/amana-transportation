import React from 'react';
import type { Page } from '../types';

interface HeaderProps {
  onMenuClick: () => void;
  onNavigate: (page: Page, anchor?: string) => void;
  isAccessibilityMode: boolean;
  onToggleAccessibility: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onNavigate, isAccessibilityMode, onToggleAccessibility }) => {
  return (
    <header className="bg-gray-800 text-white shadow-md sticky top-0 z-40 border-b-4 border-green-500">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div 
          className="text-2xl font-bold tracking-wider cursor-pointer"
          onClick={() => onNavigate('home')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('home')}
        >
          <span className="text-green-400">Amana</span>Trans
        </div>
        <nav className="flex items-center gap-2">
           <button
            onClick={onToggleAccessibility}
            className={`p-2 rounded-md transition-colors ${isAccessibilityMode ? 'bg-green-500' : 'hover:bg-gray-700'} focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-400`}
            aria-pressed={isAccessibilityMode}
            aria-label="Toggle Accessibility Mode"
           >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 3.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10.5 9a.5.5 0 00-1 0v6a.5.5 0 001 0V9z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM3 10a7 7 0 1114 0 7 7 0 01-14 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={onMenuClick}
            className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-400 transition-colors"
            aria-label="Open menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;