// FIX: Correctly import useState, useMemo, and useEffect from React.
import React, { useState, useMemo, useEffect } from 'react';
import { useTour } from './hooks/TourDataProvider';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import PackageBuilder from './components/PackageBuilder';
import RouteBuilder from './components/RouteBuilder';
import SettingsModal from './components/SettingsModal';
import AiAssistant from './components/AiAssistant';
import Sidebar from './components/Sidebar';
import { useI18n } from './hooks/useI18n';

export type View =
  | { type: 'DASHBOARD' }
  | { type: 'PACKAGES_LIST' }
  | { type: 'ROUTES_LIST' }
  | { type: 'CREATE_PACKAGE' }
  | { type: 'EDIT_PACKAGE'; packageId: string }
  | { type: 'CREATE_ROUTE' }
  | { type: 'EDIT_ROUTE'; routeId: string };

const App: React.FC = () => {
  const tourData = useTour();
  const [view, setView] = useState<View>({ type: 'DASHBOARD' });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const { t } = useI18n();

  const { packages, routes, settings, addPackage, updatePackage, addRoute, updateRoute, setSettings } = tourData;

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(settings.theme === 'dark' ? 'light' : 'dark');
    root.classList.add(settings.theme);
    root.lang = settings.language;
  }, [settings.theme, settings.language]);

  const activePackage = useMemo(() => {
    if (view.type === 'EDIT_PACKAGE') {
      return packages.find(p => p.id === view.packageId);
    }
    return undefined;
  }, [view, packages]);

  const activeRoute = useMemo(() => {
    if (view.type === 'EDIT_ROUTE') {
      return routes.find(r => r.id === view.routeId);
    }
    return undefined;
  }, [view, routes]);

  const getTitleForView = (currentView: View): string => {
    switch (currentView.type) {
      case 'DASHBOARD': return t('dashboard');
      case 'PACKAGES_LIST': return t('tourPackages');
      case 'ROUTES_LIST': return t('tourRoutes');
      case 'CREATE_PACKAGE': return t('createPackage');
      case 'EDIT_PACKAGE': return t('editPackage');
      case 'CREATE_ROUTE': return t('createRoute');
      case 'EDIT_ROUTE': return t('editRoute');
      default: return 'TourForge';
    }
  };


  const renderContent = () => {
    switch (view.type) {
      case 'DASHBOARD':
        return <Dashboard tourData={tourData} setView={setView} isHomePage={true} />;
      case 'PACKAGES_LIST':
      case 'ROUTES_LIST':
        return <Dashboard tourData={tourData} setView={setView} initialTab={view.type === 'ROUTES_LIST' ? 'routes' : 'packages'} />;
      case 'CREATE_PACKAGE':
        return <PackageBuilder allRoutes={routes} onSave={addPackage} onCancel={() => setView({ type: 'PACKAGES_LIST' })} settings={settings} />;
      case 'EDIT_PACKAGE':
        return activePackage ? <PackageBuilder existingPackage={activePackage} allRoutes={routes} onSave={updatePackage} onCancel={() => setView({ type: 'PACKAGES_LIST' })} settings={settings} /> : <Dashboard tourData={tourData} setView={setView} />;
      case 'CREATE_ROUTE':
        return <RouteBuilder onSave={addRoute} onCancel={() => setView({ type: 'ROUTES_LIST' })} settings={settings} />;
      case 'EDIT_ROUTE':
        return activeRoute ? <RouteBuilder existingRoute={activeRoute} onSave={updateRoute} onCancel={() => setView({ type: 'ROUTES_LIST' })} settings={settings} /> : <Dashboard tourData={tourData} setView={setView} />;
      default:
        return <Dashboard tourData={tourData} setView={setView} />;
    }
  };

  return (
    <div className="flex h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <Sidebar view={view} setView={setView} onSettingsClick={() => setIsSettingsOpen(true)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getTitleForView(view)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {renderContent()}
        </main>
      </div>
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={setSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
      <AiAssistant isOpen={isAiAssistantOpen} onClose={() => setIsAiAssistantOpen(false)} />
       <button
        onClick={() => setIsAiAssistantOpen(true)}
        className="fixed bottom-6 right-6 bg-[var(--color-accent)] text-white p-4 rounded-full shadow-lg hover:bg-[var(--color-accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-slate-900 transition-transform transform hover:scale-110"
        aria-label="Open AI Assistant"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
      </button>
    </div>
  );
};

export default App;
