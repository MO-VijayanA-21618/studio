import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  const { t } = useLanguage();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="200"
      height="50"
      {...props}
    >
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#FDE047', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#D4AF37', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <rect width="200" height="50" fill="none" />
      <path 
        d="M15 10 C20 5, 30 5, 35 10 L35 40 C30 45, 20 45, 15 40 Z" 
        fill="url(#goldGradient)"
      />
      <path 
        d="M20 12 C23.33 9.33, 26.67 9.33, 30 12 L30 38 C26.67 40.67, 23.33 40.67, 20 38 Z"
        fill="hsl(var(--background))"
        className="transition-colors"
      />
      <text
        x="45"
        y="35"
        fontFamily="sans-serif"
        fontSize="16"
        fontWeight="bold"
        fill="hsl(var(--foreground))"
        className="transition-colors"
      >
        {t.login.companyName}
      </text>
    </svg>
  );
}
