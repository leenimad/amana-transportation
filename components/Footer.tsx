import React from 'react';
import type { Page } from '../types';

interface FooterProps {
  onNavigate: (page: Page, anchor?: string) => void;
}

const FooterLink: React.FC<{ children: React.ReactNode; onClick: () => void }> = ({ children, onClick }) => (
  <button onClick={onClick} className="text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 rounded">
    {children}
  </button>
);

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-gray-800 text-gray-400 py-8 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center space-x-6 mb-4">
            <FooterLink onClick={() => onNavigate('home')}>Home</FooterLink>
            <FooterLink onClick={() => onNavigate('about')}>About Us</FooterLink>
            <FooterLink onClick={() => onNavigate('contact')}>Contact</FooterLink>
        </div>
        <p>&copy; {new Date().getFullYear()} Amana Transportation. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;