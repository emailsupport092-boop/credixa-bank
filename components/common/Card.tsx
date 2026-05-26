import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
}

export default function Card({ children, className = '', padding = 'md', shadow = true }: CardProps) {
  const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };

  return (
    <div className={`bg-white rounded-xl ${shadow ? 'shadow-sm' : ''} border border-gray-100 ${paddings[padding]} ${className}`}>
      {children}
    </div>
  );
}
