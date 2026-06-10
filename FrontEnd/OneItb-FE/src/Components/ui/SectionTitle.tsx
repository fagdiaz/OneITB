import React from 'react';

interface SectionTitleProps {
  children: React.ReactNode;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ children }) => {
  return (
    <div className="mb-3 print-avoid-break">
      <h2 className="text-xs md:text-[13px] font-serif font-bold text-slate-900 mb-1.5 tracking-wide">
        {children}
      </h2>
      <div className="h-[1px] bg-slate-800/20 w-full" />
    </div>
  );
};
