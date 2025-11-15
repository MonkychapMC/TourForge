import React, { createContext, useContext, ReactNode } from 'react';
import { useTourData, UseTourDataReturnType } from './useTourData';

const TourDataContext = createContext<UseTourDataReturnType | undefined>(undefined);

export const TourDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const tourData = useTourData();
  return (
    <TourDataContext.Provider value={tourData}>
      {children}
    </TourDataContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourDataContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourDataProvider');
  }
  return context;
};
