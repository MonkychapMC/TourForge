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
      // Ensure settings are merged with defaults to avoid missing keys on updates
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

  // If no data in localStorage, create initial example data
  const exampleRouteId = `route-${generateShortId()}`;
  const exampleRoute: TourRoute = {
    id: exampleRouteId,
    name: "Historic Center Walking Tour",
    description: "A 3-hour guided walk through the most iconic landmarks of the city center.",
    stops: [
      { id: generateShortId(), name: "Main Square", description: "The heart of the city's history." },
      { id: generateShortId(), name: "National Cathedral", description: "A masterpiece of colonial architecture." },
      { id: generateShortId(), name: "Founder's Museum", description: "Learn about the origins of the city." }
    ],
    kilometers: 5,
    durationHours: 3,
    personCount: 15,
    quantities: { guide: 1, medical: 15, transport: 0, logistics: 15 },
    photographerCost: 150,
    isPhotographerOptional: true
  };

  const examplePackage: TourPackage = {
    id: `pkg-${generateShortId()}`,
    name: "Capital City Discovery",
    description: "Experience the best of the capital with our comprehensive package, including a historic tour and all necessary services.",
    imageUrl: `https://images.unsplash.com/photo-1549877452-9c3e87a42e47?q=80&w=2070&auto=format&fit=crop`,
    personCount: 15,
    costs: { transport: 80, lodging: 200, services: 50 },
    routeIds: [exampleRouteId]
  };

  return {
    packages: [examplePackage],
    routes: [exampleRoute],
    settings: defaultSettings,
  };
};

export const useTourData = () => {
  const [data, setData] = useState<TourData>(getInitialState);

  // FIX: Corrected a syntax error in the try-catch block. The catch statement was missing curly braces and there was an extra closing brace, which broke the function's scope.
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