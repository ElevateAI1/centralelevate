import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  Users, 
  BadgeDollarSign, 
  CreditCard, 
  Cpu, 
  MessageSquare,
  LogOut,
  Hexagon,
  Lock,
  Rocket,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../store';
import { Role } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, tasks, projects } = useStore();
  const [unreadCounts, setUnreadCounts] = React.useState<{ tasks: number; projects: number }>({ tasks: 0, projects: 0 });
  
  // Load collapsed state from localStorage
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar_collapsed');
      return saved === 'true';
    }
    return false;
  });

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar_collapsed', newState.toString());
    // Dispatch custom event to notify App component
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { collapsed: newState } }));
  };

  // Calcular notificaciones no vistas
  React.useEffect(() => {
    if (!user) return;

    // Contar tareas no completadas asignadas al usuario que no han sido vistas
    const lastVisitedTasks = localStorage.getItem(`visited_tasks_${user.id}`);
    const visitedTaskIds = lastVisitedTasks ? JSON.parse(lastVisitedTasks) : [];
    const unreadTasks = tasks.filter(
      t => t.assigneeId === user.id && t.status !== 'Done' && !visitedTaskIds.includes(t.id)
    ).length;

    // Contar proyectos donde el usuario está en el equipo y no han sido vistos
    const lastVisitedProjects = localStorage.getItem(`visited_projects_${user.id}`);
    const visitedProjectIds = lastVisitedProjects ? JSON.parse(lastVisitedProjects) : [];
    const unreadProjects = projects.filter(
      p => p.team.includes(user.id) && !visitedProjectIds.includes(p.id)
    ).length;

    setUnreadCounts({ tasks: unreadTasks, projects: unreadProjects });
  }, [tasks, projects, user]);

  // Marcar como leído al entrar al tab
  React.useEffect(() => {
    if (!user || !activeTab) return;

    if (activeTab === 'tasks') {
      // Guardar todas las tareas actuales como visitadas
      const taskIds = tasks.filter(t => t.assigneeId === user.id).map(t => t.id);
      localStorage.setItem(`visited_tasks_${user.id}`, JSON.stringify(taskIds));
      setUnreadCounts(prev => ({ ...prev, tasks: 0 }));
    }

    if (activeTab === 'projects') {
      // Guardar los proyectos actuales como visitados
      const projectIds = projects.map(p => p.id);
      localStorage.setItem(`visited_projects_${user.id}`, JSON.stringify(projectIds));
      setUnreadCounts(prev => ({ ...prev, projects: 0 }));
    }
  }, [activeTab, user, tasks, projects]);

  // Calculate real counts
  const activeProjectsCount = projects.filter(p => p.status !== 'Delivered').length;
  const pendingTasksCount = user ? tasks.filter(t => t.assigneeId === user.id && t.status !== 'Done').length : 0;

  const menuItems: Array<{ id: string; icon: any; label: string; badge?: number }> = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Panel Principal' },
    { id: 'projects', icon: Briefcase, label: 'Proyectos', badge: activeProjectsCount > 0 ? activeProjectsCount : undefined },
    { id: 'elevate', icon: Rocket, label: 'Central Elevate' },
    { id: 'tasks', icon: CheckSquare, label: 'Mis Tareas', badge: pendingTasksCount > 0 ? pendingTasksCount : undefined },
    { id: 'leads', icon: Users, label: 'CRM y Leads' },
    { id: 'finance', icon: BadgeDollarSign, label: 'Finanzas' },
    { id: 'expenses', icon: CreditCard, label: 'Suscripciones' },
    { id: 'resources', icon: Cpu, label: 'Recursos IA' },
    { id: 'comms', icon: MessageSquare, label: 'Comunicación' },
  ];

  // Logic to determine if a tab is allowed for the current user role
  const isAllowed = (tabId: string, role: Role): boolean => {
    if (role === 'Founder') return true;

    const permissions: Record<string, string[]> = {
      dashboard: ['Developer', 'Sales', 'CFO', 'CTO'],
      
      // Developer: Projects, Elevate, My tasks, IA Resources, Communications
      projects: ['Developer', 'CTO'],
      elevate: ['Developer', 'Founder', 'CTO'],
      tasks: ['Developer', 'Sales', 'CTO'],
      resources: ['Developer', 'CTO'],
      
      // Sales: My tasks, CRM & Leads, Communications
      leads: ['Sales', 'CFO'],
      
      // CFO: CRM & LEADS, Financials, Subscriptions, Communications
      finance: ['CFO', 'Founder'],
      expenses: ['CFO', 'Founder'],
      
      // CTO: Projects, Elevate, Tasks, Resources, Communications (NO leads, finance, expenses)
      
      // All
      comms: ['Developer', 'Sales', 'CFO', 'CTO'],
    };

    return permissions[tabId]?.includes(role) || false;
  };

  // Helper to get the "Required Role" label
  const getRequiredRoleLabel = (tabId: string): string => {
    if (tabId === 'leads' || tabId === 'finance' || tabId === 'expenses') return 'Fin/Sales';
    if (tabId === 'tasks' || tabId === 'resources' || tabId === 'projects') return 'Dev';
    return 'Admin';
  };

  if (!user) return null;

  // Separate items into allowed and restricted
  const allowedItems = menuItems.filter(item => isAllowed(item.id, user.role));
  const restrictedItems = menuItems.filter(item => !isAllowed(item.id, user.role));

  const renderItem = (item: typeof menuItems[0], allowed: boolean) => {
    const active = activeTab === item.id;
    
    // Obtener el conteo de notificaciones para este item
    const getNotificationCount = () => {
      if (item.id === 'tasks') {
        return item.badge || (unreadCounts.tasks > 0 ? unreadCounts.tasks : 0);
      }
      if (item.id === 'projects') {
        return item.badge || (unreadCounts.projects > 0 ? unreadCounts.projects : 0);
      }
      return 0;
    };

    const notificationCount = getNotificationCount();

    return (
      <button
        key={item.id}
        onClick={() => allowed && setActiveTab(item.id)}
        disabled={!allowed}
        className={`w-full flex items-center gap-3 px-3 py-3 transition-all duration-200 group relative ${
          active
            ? 'bg-black dark:bg-white text-white dark:text-slate-900 rounded-2xl'
            : allowed 
              ? 'text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-xl'
              : 'text-slate-400/40 dark:text-white/40 opacity-60 cursor-not-allowed rounded-xl'
        }`}
      >
        <div className="relative">
          <item.icon
            size={20}
            className={`transition-colors ${
              active 
                ? 'text-white dark:text-slate-900' 
                : allowed 
                  ? 'text-slate-600 dark:text-white group-hover:text-violet-600 dark:group-hover:text-white' 
                  : 'text-slate-400 dark:text-white/40'
            }`}
          />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white dark:border-black shadow-lg">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </div>
        <span className={`font-medium text-sm flex-1 text-left transition-opacity ${
          isCollapsed ? 'hidden' : 'hidden md:block'
        } ${active ? 'text-white dark:text-slate-900' : 'text-slate-900 dark:text-white'}`}>{item.label}</span>
        
        {active && !notificationCount && !isCollapsed && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-900 hidden md:block" />
        )}

        {/* Disabled Badge */}
        {!allowed && !isCollapsed && (
          <div className="hidden md:flex ml-auto items-center gap-1 bg-slate-200/50 dark:bg-black/60 px-1.5 py-0.5 rounded border border-black/5 dark:border-white/20">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 dark:text-white/60">
              {getRequiredRoleLabel(item.id)}
            </span>
            <Lock size={8} className="text-slate-600 dark:text-white/60" />
          </div>
        )}
      </button>
    );
  };

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-20 md:w-64'} bg-white/90 dark:bg-black/90 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300`}>
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-slate-200 dark:border-white/5 relative">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 p-2 rounded-lg shadow-lg shadow-violet-500/20 animate-gradient">
            <Hexagon className="text-white w-6 h-6" />
          </div>
          <span className={`${isCollapsed ? 'hidden' : 'hidden md:block'} font-bold text-xl tracking-tight text-slate-900 dark:text-white`}>
            Central<span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 dark:from-violet-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-gradient">Elevate</span>
          </span>
        </div>
        <button
          onClick={toggleCollapse}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
          title={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} className="text-slate-600 dark:text-white" /> : <ChevronLeft size={16} className="text-slate-600 dark:text-white" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {allowedItems.map(item => renderItem(item, true))}
        
        {/* Separator if needed */}
        {restrictedItems.length > 0 && (
          <div className="my-4 border-t border-slate-200 dark:border-white/5 mx-2"></div>
        )}

        {restrictedItems.map(item => renderItem(item, false))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-white/5">
        <div className={`mb-4 px-2 ${isCollapsed ? 'hidden' : 'hidden md:block'}`}>
             <p className="text-[10px] text-slate-500 dark:text-white/60 uppercase tracking-widest font-semibold">Rol Actual</p>
             <p className="text-sm font-medium text-violet-600 dark:text-violet-400">{user.role}</p>
        </div>
        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 dark:text-white hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
          <LogOut size={20} className="text-slate-600 dark:text-white" />
          <span className={`${isCollapsed ? 'hidden' : 'hidden md:block'} font-medium text-sm text-slate-600 dark:text-white`}>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};