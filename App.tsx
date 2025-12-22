import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ProjectBoard } from './components/ProjectBoard';
import { TasksView } from './components/TasksView';
import { LeadsPipeline } from './components/LeadsPipeline';
import { FinanceView } from './components/FinanceView';
import { SubscriptionsView } from './components/SubscriptionsView';
import { AIResourcesView } from './components/AIResourcesView';
import { CommunicationsView } from './components/CommunicationsView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { CentralElevateView } from './components/CentralElevateView';
import { AuthView } from './components/Auth/AuthView';
import { ParticlesBackground } from './components/ParticlesBackground';
import { AppProvider, useStore } from './store';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading, loadUser } = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!user && !loading) {
      loadUser();
    }
  }, [user, loading, loadUser]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard setActiveTab={setActiveTab} />;
      case 'projects': return <ProjectBoard />;
      case 'elevate': return <CentralElevateView />;
      case 'tasks': return <TasksView />;
      case 'leads': return <LeadsPipeline />;
      case 'finance': return <FinanceView />;
      case 'expenses': return <SubscriptionsView />;
      case 'resources': return <AIResourcesView />;
      case 'comms': return <CommunicationsView />;
      case 'profile': return <ProfileView />;
      case 'settings': return <SettingsView />;
      default: return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#05050a]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return <AuthView onAuthSuccess={loadUser} />;
  }

  // Show main app if logged in
  return (
    <div className="flex min-h-screen bg-white dark:bg-[#05050a] text-slate-900 dark:text-slate-200 font-sans selection:bg-violet-500/30 relative">
      <ParticlesBackground />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300 relative z-10">
        <Header setActiveTab={setActiveTab} />
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto overflow-x-hidden relative bg-slate-50/80 dark:bg-[#05050a]/80 backdrop-blur-sm">
           {/* Background decorative blobs */}
           <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-violet-600/10 dark:bg-violet-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />
           <div className="fixed bottom-0 left-64 w-[500px] h-[500px] bg-blue-600/5 dark:bg-blue-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />
           
           {renderContent()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;