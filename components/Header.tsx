import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, Settings, LogOut, HelpCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store';
import { Role } from '../types';
import { SearchModal } from './SearchModal';

interface HeaderProps {
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ setActiveTab }) => {
  const { user, originalUserRole, setUserRole, signOut, tasks, projects } = useStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showRoleTooltip, setShowRoleTooltip] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  
  // Calculate unread notifications - only projects with progress < 100%
  const unreadNotifications = React.useMemo(() => {
    if (!user) return 0;
    // Count pending tasks assigned to user
    const pendingTasks = tasks.filter(t => t.assigneeId === user.id && t.status !== 'Done').length;
    // Count active projects user is part of that are NOT completed (progress < 100%)
    const activeProjects = projects.filter(p => 
      p.team.includes(user.id) && 
      p.progress < 100 && 
      p.status !== 'Delivered'
    ).length;
    return pendingTasks + activeProjects;
  }, [tasks, projects, user]);

  // Get notification items
  const notificationItems = React.useMemo(() => {
    if (!user) return [];
    const items: Array<{ type: 'task' | 'project'; id: string; title: string; message: string }> = [];
    
    // Add pending tasks
    tasks
      .filter(t => t.assigneeId === user.id && t.status !== 'Done')
      .forEach(task => {
        const project = projects.find(p => p.id === task.projectId);
        items.push({
          type: 'task',
          id: task.id,
          title: task.title,
          message: project ? `Proyecto: ${project.name}` : 'Tarea pendiente'
        });
      });
    
    // Add active projects (progress < 100%)
    projects
      .filter(p => p.team.includes(user.id) && p.progress < 100 && p.status !== 'Delivered')
      .forEach(project => {
        items.push({
          type: 'project',
          id: project.id,
          title: project.name,
          message: `Progreso: ${project.progress}% - ${project.status}`
        });
      });
    
    return items;
  }, [tasks, projects, user]);

  const clearNotifications = () => {
    if (!user) return;
    // Mark all current notifications as read
    const taskIds = tasks.filter(t => t.assigneeId === user.id).map(t => t.id);
    const projectIds = projects.filter(p => p.team.includes(user.id)).map(p => p.id);
    localStorage.setItem(`visited_tasks_${user.id}`, JSON.stringify(taskIds));
    localStorage.setItem(`visited_projects_${user.id}`, JSON.stringify(projectIds));
    setIsNotificationsOpen(false);
  };

  if (!user || !originalUserRole) return null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    setIsDropdownOpen(false);
  };

  // Determinar qué roles puede ver el usuario actual según jerarquía
  // Usar originalUserRole en lugar de user.role para mantener los permisos correctos
  const getAvailableRoles = (originalRole: Role): { role: Role; disabled: boolean }[] => {
    const allRoles: Role[] = ['Founder', 'CTO', 'CFO', 'Developer', 'Sales'];
    
    switch (originalRole) {
      case 'Founder':
        // Founder puede ver todo
        return allRoles.map(role => ({ role, disabled: false }));
      
      case 'CTO':
        // CTO puede ver: CTO, CFO, Developer, Sales (Founder bloqueado)
        return allRoles.map(role => ({
          role,
          disabled: role === 'Founder'
        }));
      
      case 'CFO':
        // CFO puede ver: CFO, Developer, Sales (Founder y CTO bloqueados)
        return allRoles.map(role => ({
          role,
          disabled: role === 'Founder' || role === 'CTO'
        }));
      
      default:
        // Otros roles no pueden usar View As
        return [];
    }
  };

  // Solo mostrar View As para Founder, CTO y CFO (usar originalUserRole)
  const canUseViewAs = originalUserRole === 'Founder' || originalUserRole === 'CTO' || originalUserRole === 'CFO';
  const availableRoles = canUseViewAs ? getAvailableRoles(originalUserRole) : [];

  // Handle ⌘K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="h-20 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 sticky top-0 z-40 px-8 flex items-center justify-between">
      {/* Search Bar */}
      <div 
        className="hidden md:flex items-center bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-white/20 rounded-full px-4 py-2 w-96 focus-within:ring-2 focus-within:ring-violet-500/30 transition-all cursor-pointer"
        onClick={() => setIsSearchOpen(true)}
      >
        <Search className="text-slate-500 dark:text-white w-4 h-4 mr-3" />
        <input 
          type="text" 
          placeholder="Buscar proyectos, tareas o leads..." 
          className="bg-transparent border-none outline-none text-sm text-slate-900 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-500 w-full cursor-pointer"
          readOnly
        />
        <span className="text-xs text-slate-600 dark:text-slate-600 border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 rounded ml-2">⌘K</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        {/* Role Switcher - Solo para Founder, CTO y CFO */}
        {canUseViewAs && (
          <div className="hidden md:flex flex-col items-end mr-4 relative">
            <div className="flex items-center gap-1 mb-0.5">
              <label className="text-[10px] uppercase tracking-wider text-slate-600 dark:text-white/80 font-semibold">Panel como:</label>
              <HelpCircle 
                size={10} 
                className="text-slate-400 cursor-help"
                onMouseEnter={() => setShowRoleTooltip('help')}
                onMouseLeave={() => setShowRoleTooltip(null)}
              />
            </div>
            {showRoleTooltip === 'help' && (
              <div className="absolute bottom-full right-0 mb-2 w-64 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-lg p-2 shadow-lg z-50">
                Mostrar datos relevantes para este rol
                <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800"></div>
              </div>
            )}
            <div className="relative">
              <select 
                value={user.role} 
                onChange={(e) => {
                  const selectedRole = e.target.value as Role;
                  const selectedOption = availableRoles.find(r => r.role === selectedRole);
                  if (selectedOption && !selectedOption.disabled) {
                    setUserRole(selectedRole);
                  }
                }}
                className="bg-slate-200 dark:bg-black/60 border-none text-xs text-slate-900 dark:text-white rounded px-2 py-1 outline-none cursor-pointer hover:bg-slate-300 dark:hover:bg-black/80 transition-colors"
              >
                {availableRoles.map(({ role, disabled }) => (
                  <option 
                    key={role} 
                    value={role}
                    disabled={disabled}
                    style={disabled ? { 
                      backgroundColor: '#1e293b', 
                      color: '#64748b',
                      fontStyle: 'italic'
                    } : {}}
                  >
                    {role}{disabled ? ' (Bloqueado)' : ''}
                  </option>
                ))}
              </select>
              {availableRoles.some(r => r.disabled) && (
                <div className="absolute -right-6 top-0 bottom-0 flex items-center">
                  <HelpCircle 
                    size={12} 
                    className="text-slate-400 cursor-help"
                    onMouseEnter={() => setShowRoleTooltip('blocked')}
                    onMouseLeave={() => setShowRoleTooltip(null)}
                  />
                  {showRoleTooltip === 'blocked' && (
                    <div className="absolute bottom-full right-0 mb-2 w-64 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-lg p-2 shadow-lg z-50">
                      Solo disponible para founders activos. Contacta a admin@nexus.ai para más información.
                      <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-slate-600 dark:text-white hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#0f172a]">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white dark:bg-black border border-slate-200 dark:border-white/20 rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200 z-50 max-h-[500px] overflow-y-auto">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notificaciones</h3>
                {notificationItems.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                    title="Limpiar notificaciones"
                  >
                    <Trash2 size={12} />
                    Limpiar
                  </button>
                )}
              </div>
              
              <div className="p-2">
                {notificationItems.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-white/60">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50 dark:text-white/60" />
                    <p className="text-sm dark:text-white/60">No hay notificaciones nuevas</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notificationItems.map((item) => (
                      <div
                        key={`${item.type}-${item.id}`}
                        className="p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => {
                          if (item.type === 'project') {
                            setActiveTab('projects');
                          } else {
                            setActiveTab('tasks');
                          }
                          setIsNotificationsOpen(false);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 p-1.5 rounded-full ${
                            item.type === 'task' 
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              : 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                          }`}>
                            {item.type === 'task' ? (
                              <CheckCircle2 size={14} />
                            ) : (
                              <Bell size={14} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {item.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {item.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Dropdown */}
        <div className="relative pl-6 border-l border-white/10" ref={dropdownRef}>
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="text-right hidden md:block select-none">
              <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">{user.name}</p>
              <p className="text-xs text-violet-600 dark:text-violet-400">{user.role}</p>
            </div>
            <div className="relative">
               <img 
                src={user.avatar} 
                alt={user.name} 
                className={`w-10 h-10 rounded-full border-2 transition-all object-cover ${isDropdownOpen ? 'border-violet-500 ring-2 ring-violet-500/30' : 'border-white/10 group-hover:border-violet-500'}`}
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f172a]"></div>
            </div>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-14 w-56 bg-white dark:bg-black border border-slate-200 dark:border-white/20 rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200 z-50">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-white/5 mb-1 md:hidden">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-violet-400">{user.role}</p>
              </div>
              
              <button 
                onClick={() => handleNavigate('profile')}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-colors"
              >
                <User size={16} /> Perfil
              </button>
              <button 
                onClick={() => handleNavigate('settings')}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-colors"
              >
                <Settings size={16} /> Configuración
              </button>
              
              <div className="h-px bg-slate-200 dark:bg-white/5 my-1" />
              
              <button 
                onClick={async () => {
                  await signOut();
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors"
              >
                <LogOut size={16} /> Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)}
        onNavigate={setActiveTab}
      />
    </header>
  );
};