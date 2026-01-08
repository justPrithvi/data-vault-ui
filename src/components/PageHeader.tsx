import React, { memo } from 'react';

interface PageHeaderProps {
  icon: string;
  title: string;
  subtitle: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  titleHighlight?: string;
  actionButton?: {
    label: string;
    icon: string;
    onClick: () => void;
  };
  onMenuClick?: () => void;
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
  onMenuClick,
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 lg:gap-3 bg-slate-800 rounded-lg lg:rounded-xl shadow-lg border border-slate-700 p-2 lg:p-3 flex-shrink-0">
      <div className="flex items-center gap-2 lg:gap-3 min-w-0">
        {/* Hamburger Menu Button (Mobile Only) */}
        <button
          onClick={onMenuClick}
          className="lg:hidden flex-shrink-0 w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
        >
          <span className="text-xl">☰</span>
        </button>

        {/* Icon */}
        <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
          <span className="text-lg lg:text-xl">{icon}</span>
        </div>

        {/* Title */}
        <div className="min-w-0 flex-1">
          <h1 className="text-sm lg:text-base font-bold text-slate-100 truncate">
            {title}
            {titleHighlight && (
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {titleHighlight}
              </span>
            )}
          </h1>
          <p className="text-[10px] lg:text-xs text-slate-400 truncate">
            {subtitle}
          </p>
        </div>
      </div>
      
      {/* Search Bar and Action Button Row */}
      <div className="flex items-center gap-2 lg:gap-3 flex-1 lg:flex-initial">
        {/* Search Bar */}
        <div className="relative flex-1 lg:w-64 xl:w-80">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 border border-slate-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-700 text-slate-100 placeholder-slate-400 text-xs"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Optional Action Button */}
        {actionButton && (
          <button
            className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 lg:px-4 py-1.5 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1.5 lg:gap-2 font-medium text-xs whitespace-nowrap flex-shrink-0"
            onClick={actionButton.onClick}
          >
            <span className="text-base lg:text-lg">{actionButton.icon}</span>
            <span className="hidden sm:inline">{actionButton.label}</span>
            <span className="sm:hidden">Add</span>
          </button>
        )}
      </div>
    </div>
  );
});

PageHeader.displayName = 'PageHeader';

export default PageHeader;

