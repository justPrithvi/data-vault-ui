import React, { memo } from 'react';

interface PageHeaderProps {
  icon: string;
  title: string;
  subtitle: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  titleHighlight?: string; // Optional highlighted part of title (e.g., user name)
  actionButton?: {
    label: string;
    icon: string;
    onClick: () => void;
  };
}

const PageHeader: React.FC<PageHeaderProps> = memo(({
  icon,
  title,
  subtitle,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  titleHighlight,
  actionButton,
}) => {
  return (
    <div className="flex flex-row items-center justify-between gap-3 bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-4 h-[88px] flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0 flex-shrink">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-100 truncate whitespace-nowrap">
            {title}
            {titleHighlight && (
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {titleHighlight}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 truncate whitespace-nowrap">
            {subtitle}
          </p>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="relative w-96 flex-shrink-0">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-9 py-2 border-2 border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-700 text-slate-100 placeholder-slate-400 text-sm"
        />
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
          🔍
        </span>
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Optional Action Button - Fixed Width Container */}
      <div className="w-[220px] flex-shrink-0">
        {actionButton && (
          <button
            className="w-full group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 font-semibold hover:scale-105 whitespace-nowrap"
            onClick={actionButton.onClick}
          >
            <span className="text-xl">{actionButton.icon}</span>
            <span>{actionButton.label}</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">+</span>
          </button>
        )}
      </div>
    </div>
  );
});

PageHeader.displayName = 'PageHeader';

export default PageHeader;

