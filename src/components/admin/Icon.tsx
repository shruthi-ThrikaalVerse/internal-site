import React from 'react';
import * as LucideIcons from 'lucide-react';

export const Icon = ({ name, className }: { name: string; className?: string }) => {
  const LucideIcon = (LucideIcons as any)[name];
  return LucideIcon ? <LucideIcon className={className} /> : null;
};

export default Icon;
