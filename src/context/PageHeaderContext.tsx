"use client";

import React, { createContext, useContext, useState, ReactNode, useRef, useCallback } from 'react';

interface ActionButton {
  label: string;
  icon: string;
  onClick: () => void;
}

interface PageHeaderConfig {
  icon: string;
  title: string;
  subtitle: string;
  searchPlaceholder?: string;
  titleHighlight?: string;
  actionButton?: ActionButton;
  onSearchChange?: (value: string) => void;
}

interface PageHeaderContextType {
  headerConfig: PageHeaderConfig | null;
  searchQuery: string;
  setHeaderConfig: (config: PageHeaderConfig) => void;
  setSearchQuery: (query: string) => void;
}

const PageHeaderContext = createContext<PageHeaderContextType | undefined>(undefined);

export const PageHeaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [headerConfig, setHeaderConfig] = useState<PageHeaderConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSetHeaderConfig = useCallback((config: PageHeaderConfig) => {
    setHeaderConfig(config);
    setSearchQuery(""); // Reset search when changing pages
  }, []);

  return (
    <PageHeaderContext.Provider value={{ 
      headerConfig, 
      searchQuery,
      setHeaderConfig: handleSetHeaderConfig,
      setSearchQuery
    }}>
      {children}
    </PageHeaderContext.Provider>
  );
};

export const usePageHeader = () => {
  const context = useContext(PageHeaderContext);
  if (!context) {
    throw new Error('usePageHeader must be used within PageHeaderProvider');
  }
  return context;
};

