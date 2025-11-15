export type Language = 'en' | 'es' | 'fr' | 'pt';
export type Theme = 'light' | 'dark';

export interface UserSettings {
  userId: string;
  exchangeRate: number;
  profitMargin: number;
  language: Language;
  theme: Theme;
  unitCosts: {
    guide: number;
    medical: number;
    transport: number;
    logistics: number;
  };
}

export interface TourStop {
  id: string;
  name: string;
  description: string;
}

export interface TourRoute {
  id: string;
  name: string;
  description: string;
  stops: TourStop[];
  kilometers: number;
  durationHours: number;
  personCount: number;
  quantities: {
    guide: number;
    medical: number;
    transport: number;
    logistics: number;
  };
  photographerCost: number;
  isPhotographerOptional: boolean;
}

export interface TourPackage {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  personCount: number;
  costs: {
    transport: number;
    lodging: number;
    services: number;
  };
  routeIds: string[];
}