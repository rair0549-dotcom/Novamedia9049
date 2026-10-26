/**
 * Nova Media - Original Brand Wordmark
 * Geometric Nova Star / Prism Glyph + Refined Typography
 */

import React from 'react';

interface NovaWordmarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const NovaWordmark: React.FC<NovaWordmarkProps> = ({ size = 'md', className = '' }) => {
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const textSizes = {
    sm: 'text-sm font-semibold tracking-tight',
    md: 'text-base font-bold tracking-tight',
    lg: 'text-xl font-bold tracking-tight',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Original Geometric Nova Prism SVG */}
      <div className={`relative flex items-center justify-center ${iconSizes[size]}`}>
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_8px_rgba(98,181,255,0.35)]">
          <path
            d="M16 2L20.2 11.8L30 16L20.2 20.2L16 30L11.8 20.2L2 16L11.8 11.8L16 2Z"
            fill="url(#nova_gradient)"
          />
          <path
            d="M16 7L18.8 13.2L25 16L18.8 18.8L16 25L13.2 18.8L7 16L13.2 13.2L16 7Z"
            fill="#090B10"
            fillOpacity="0.8"
          />
          <circle cx="16" cy="16" r="3.2" fill="#62B5FF" />
          <defs>
            <linearGradient id="nova_gradient" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#62B5FF" />
              <stop offset="0.6" stopColor="#A78BFA" />
              <stop offset="1" stopColor="#5DD6A0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex items-baseline">
        <span className={`text-[#F4F7FC] ${textSizes[size]}`}>Nova</span>
        <span className={`text-[#62B5FF] ml-1 font-semibold ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>Media</span>
      </div>
    </div>
  );
};
