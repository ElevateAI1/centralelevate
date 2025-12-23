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
import { Loader2, PartyPopper, Sparkles } from 'lucide-react';
import { Project } from './types';

const AppContent: React.FC = () => {
  const { user, loading, loadUser } = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [celebrationProject, setCelebrationProject] = useState<{ project: Project; userId: string } | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar_collapsed');
      return saved === 'true';
    }
    return false;
  });

  // Listen for sidebar collapse changes
  useEffect(() => {
    const handleSidebarToggle = (e: CustomEvent) => {
      setIsSidebarCollapsed(e.detail.collapsed);
    };
    window.addEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    return () => {
      window.removeEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!user && !loading) {
      loadUser();
    }
  }, [user, loading, loadUser]);

  // Listen for project completion events
  useEffect(() => {
    const handleProjectCompleted = (e: CustomEvent) => {
      const { project, userId } = e.detail;
      if (user && userId === user.id && project.team.includes(user.id)) {
        setCelebrationProject({ project, userId });
      }
    };

    window.addEventListener('project-completed', handleProjectCompleted as EventListener);
    return () => {
      window.removeEventListener('project-completed', handleProjectCompleted as EventListener);
    };
  }, [user]);

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
      
      <div className={`flex-1 flex flex-col transition-all duration-300 relative z-10 ${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
        <Header setActiveTab={setActiveTab} />
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto overflow-x-hidden relative bg-slate-50/80 dark:bg-[#05050a]/80 backdrop-blur-sm">
           {/* Background decorative blobs */}
           <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-violet-600/10 dark:bg-violet-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />
           <div className="fixed bottom-0 left-64 w-[500px] h-[500px] bg-blue-600/5 dark:bg-blue-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />
           
           {renderContent()}
        </main>
      </div>

      {/* Celebration Modal */}
      {celebrationProject && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setCelebrationProject(null)}
        >
          <div 
            className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 w-full max-w-md rounded-2xl border border-white/20 shadow-2xl p-8 text-center animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-24 h-24 text-yellow-300 animate-pulse" />
              </div>
              <PartyPopper className="w-16 h-16 text-white mx-auto relative z-10 animate-bounce" />
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-2">
              ¡Felicitaciones {user?.name}! 🎉
            </h2>
            <p className="text-white/90 text-lg mb-6">
              Has completado el proyecto
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6">
              <p className="text-2xl font-bold text-white">
                {celebrationProject.project.name}
              </p>
              <p className="text-white/80 text-sm mt-1">
                {celebrationProject.project.clientName}
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 mb-6 text-4xl">
              🎊 🎉 🎈 🎁 🏆 ✨ 🎯 🚀
            </div>
            
            <button
              onClick={() => setCelebrationProject(null)}
              className="w-full bg-white hover:bg-white/90 text-violet-600 font-bold py-3 rounded-xl transition-colors shadow-lg"
            >
              ¡Genial!
            </button>
          </div>
        </div>
      )}
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