
import React, { createContext, useContext, ReactNode } from 'react';
import { usePortfolioContext as usePortfolioData } from './usePortfolioContext';

// Create the context
const PortfolioContext = createContext<ReturnType<typeof usePortfolioData> | undefined>(undefined);

// Provider component
export const PortfolioProvider = ({ children }: { children: ReactNode }) => {
  const portfolioData = usePortfolioData();
  
  return (
    <PortfolioContext.Provider value={portfolioData}>
      {children}
    </PortfolioContext.Provider>
  );
};

// Hook for components to use the portfolio context
export const usePortfolioContext = () => {
  const context = useContext(PortfolioContext);
  
  if (context === undefined) {
    throw new Error('usePortfolioContext must be used within a PortfolioProvider');
  }
  
  return context;
};
