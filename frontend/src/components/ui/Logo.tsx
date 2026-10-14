import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 32, className = '', ...props }) => {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <defs>
        <linearGradient id="sl-primary-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id="sl-accent-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
        <linearGradient id="sl-base-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#312E81" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0.9" />
        </linearGradient>
        <filter id="sl-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#6366F1" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Base Anchor Tier */}
      <path
        d="M 6 28 L 20 35 L 34 28 L 20 21 Z"
        fill="url(#sl-base-grad)"
        stroke="#4338CA"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Middle Refactoring Tier */}
      <path
        d="M 8 20 L 20 26 L 32 20 L 20 14 Z"
        fill="#3730A3"
        fillOpacity="0.85"
        stroke="#6366F1"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Elevated Modern Tier */}
      <g filter="url(#sl-glow)">
        <path
          d="M 10 12 L 20 17 L 30 12 L 20 7 Z"
          fill="url(#sl-primary-grad)"
          stroke="#C7D2FE"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {/* Dynamic Ascent Beacon */}
        <path
          d="M 20 4 L 20 11 M 16.5 7.5 L 20 4 L 23.5 7.5"
          stroke="url(#sl-accent-grad)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};
