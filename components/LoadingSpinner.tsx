'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  return (
    <Loader2 className={`animate-spin text-[#06082C] ${sizeClasses[size]} ${className}`} />
  );
}

// Full page loading component
export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

// Section loading component
export function SectionLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner size="md" />
    </div>
  );
}
