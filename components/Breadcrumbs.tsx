import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
      <button
        onClick={items[0].onClick}
        className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <Home size={14} />
        <span>{items[0].label}</span>
      </button>
      {items.slice(1).map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={14} className="text-slate-400" />
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-slate-900 dark:text-white font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

