import { useState, useEffect, useCallback } from 'react';
import { TourPackage, TourRoute, UserSettings } from '../types';
import { generateShortId } from '../utils/shortId';

const LOCAL_STORAGE_KEY = 'tourPlannerData';

interface TourData {
  packages: TourPackage[];
  routes: TourRoute[];
  settings: UserSettings;
}

const getInitialState = (): TourData => {
  const defaultSettings: UserSettings = {
    userId: `user-${generateShortId()}`,
    exchangeRate: 36.50,
    profitMargin: 25,
    language: 'en',
    theme: 'light',
    unitCosts: {
      guide: 150,
      medical: 20,
      transport: 200,
      logistics: 15,
    },
  };

  try {
    const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (item) {
      const parsed = JSON.parse(item);
      return {
          ...parsed,
          settings: {
              ...defaultSettings,
              ...parsed.settings,
          }
      };
    }
  } catch (error) {
    console.error('Error reading from localStorage', error);
  }

  return {
    packages: [],
    routes: [],
    settings: defaultSettings,
  };
};

export const useTourData = () => {
  const [data, setData] = useState<TourData>(getInitialState);

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, [data]);

  const { packages, routes, settings } = data;

  const setSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setData(prevData => ({ ...prevData, settings: { ...prevData.settings, ...newSettings } }));
  }, []);

  // Packages
  const addPackage = useCallback((newPackage: TourPackage) => {
    setData(prevData => ({ ...prevData, packages: [...prevData.packages, newPackage] }));
  }, []);

  const updatePackage = useCallback((updatedPackage: TourPackage) => {
    setData(prevData => ({
      ...prevData,
      packages: prevData.packages.map(p => (p.id === updatedPackage.id ? updatedPackage : p)),
    }));
  }, []);

  const deletePackage = useCallback((packageId: string) => {
    setData(prevData => ({ ...prevData, packages: prevData.packages.filter(p => p.id !== packageId) }));
  }, []);

  // Routes
  const addRoute = useCallback((newRoute: TourRoute) => {
    setData(prevData => ({ ...prevData, routes: [...prevData.routes, newRoute] }));
  }, []);

  const updateRoute = useCallback((updatedRoute: TourRoute) => {
    setData(prevData => ({
      ...prevData,
      routes: prevData.routes.map(r => (r.id === updatedRoute.id ? updatedRoute : r)),
    }));
  }, []);

  const deleteRoute = useCallback((routeId: string) => {
    setData(prevData => ({ ...prevData, routes: prevData.routes.filter(r => r.id !== routeId) }));
  }, []);
  
  const setPackageImage = useCallback((packageId: string, imageUrl: string) => {
    setData(prevData => ({
        ...prevData,
        packages: prevData.packages.map(p => p.id === packageId ? {...p, imageUrl} : p)
    }));
  }, []);

  return {
    packages,
    routes,
    settings,
    setSettings,
    addPackage,
    updatePackage,
    deletePackage,
    addRoute,
    updateRoute,
    deleteRoute,
    setPackageImage,
  };
};

export type UseTourDataReturnType = ReturnType<typeof useTourData>;