import React from 'react';
import type { Page } from '../types';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: Page, anchor?: string) => void;
  currentPage: Page;
  hasFavorites: boolean;
}

const MenuItem: React.FC<{ children: React.ReactNode; onClick: () => void; isActive: boolean }> = ({ children, onClick, isActive }) => (
    <button
        onClick={onClick}
        className={`w-full text-left block px-6 py-4 text-lg rounded-md transition-colors ${
          isActive 
            ? 'bg-green-600 text-white font-semibold' 
            : 'text-gray-200 hover:bg-gray-700'
        }`}
    >
        {children}
    </button>
)

const Menu: React.FC<MenuProps> = ({ isOpen, onClose, onNavigate, currentPage, hasFavorites }) => {
  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Menu Panel */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        className={`fixed top-0 right-0 h-full w-72 bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white" id="menu-title">Menu</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400" aria-label="Close menu">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <nav className="p-4 space-y-2" aria-labelledby="menu-title">
            <MenuItem onClick={() => onNavigate('home')} isActive={currentPage === 'home'}>Home</MenuItem>
            
            {hasFavorites && (
              <MenuItem onClick={() => onNavigate('home', 'favorite-routes-overview')} isActive={false}>
                Your Favorites
              </MenuItem>
            )}

            <div className="pt-4 mt-4 border-t border-gray-700">
                 <h3 className="px-6 py-2 text-sm font-semibold text-gray-500 uppercase" id="company-menu-heading">Company</h3>
                 <div role="group" aria-labelledby="company-menu-heading">
                    <MenuItem onClick={() => onNavigate('about')} isActive={currentPage === 'about'}>About Amana</MenuItem>
                    <MenuItem onClick={() => onNavigate('contact')} isActive={currentPage === 'contact'}>Contact Us</MenuItem>
                 </div>
            </div>
        </nav>
      </div>
    </>
  );
};

export default Menu;