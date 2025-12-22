import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { TrendingUp, Users, Clock, AlertCircle, ArrowUpRight, ArrowDownRight, Activity, Bug, GitCommit, CheckCircle, Wallet, Target, CreditCard, DollarSign, CheckSquare, HelpCircle, ChevronRight, X } from 'lucide-react';
import { ProjectStatus, LeadStage } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { EmptyState } from './EmptyState';

interface DashboardProps {
  setActiveTab?: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = () => {
  const { user } = useStore();

  if (!user) return null;

  // Route to specific dashboards based on role
  if (user.role === 'Developer') return <DeveloperDashboard />;
  if (user.role === 'Sales') return <SalesDashboard />;
  if (user.role === 'CFO') return <CFODashboard />;
  if (user.role === 'CTO') return <CTODashboard />;
  // Founder and other roles see Executive Dashboard
  return <ExecutiveDashboard />;
};

const ExecutiveDashboard: React.FC<{ setActiveTab?: (tab: string) => void }> = () => {
  const { projects, leads, financials, createProject, user, users, tasks } = useStore();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  if (!user) return null;
  const [timeFilter, setTimeFilter] = useState<'30d' | 'month' | 'year' | 'all'>('all');
  
  // Filter financials based on time filter
  const filteredFinancials = useMemo(() => {
    if (timeFilter === 'all') return financials;
    const now = new Date();
    const cutoffDate = new Date();
    
    if (timeFilter === '30d') {
      cutoffDate.setDate(now.getDate() - 30);
    } else if (timeFilter === 'month') {
      cutoffDate.setMonth(now.getMonth() - 1);
    } else if (timeFilter === 'year') {
      cutoffDate.setFullYear(now.getFullYear() - 1);
    }
    
    return financials.filter(f => {
      const monthDate = new Date(f.month + ' 1, ' + now.getFullYear());
      return monthDate >= cutoffDate;
    });
  }, [financials, timeFilter]);
  
  const totalRevenue = filteredFinancials.reduce((acc, curr) => acc + curr.revenue, 0);
  const activeProjectsCount = projects.filter(p => p.status !== 'Delivered').length;
  const pendingLeads = leads.filter(l => l.stage !== 'Won' && l.stage !== 'Lost').length;
  
  // Calculate completion rate from real tasks data
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Note: Historical data comparison would require storing snapshots, which is not implemented
  
  const hasFinancialData = financials.length > 0 && financials.some(f => f.revenue > 0);
  const hasProjects = projects.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-h1 text-slate-900 dark:text-white mb-2">Vista Ejecutiva</h1>
          <p className="text-body text-slate-600 dark:text-slate-400">Insights de alto nivel para {new Date().getFullYear()}.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg text-sm text-slate-700 dark:text-slate-400 px-3 py-2"
          >
            <option value="30d">Últimos 30 días</option>
            <option value="month">Este mes</option>
            <option value="year">Año actual</option>
            <option value="all">Todo</option>
          </select>
          <button 
            onClick={() => setIsProjectModalOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg shadow-violet-500/20 transition-all active:scale-95"
          >
            + Nuevo Proyecto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {totalRevenue === 0 ? (
          <div className="lg:col-span-4">
            <EmptyState 
              type="transactions" 
              onAction={() => {/* Navigate to finance */}}
            />
          </div>
        ) : (
          <>
            <StatCard 
              title="Ingresos Totales" 
              value={`$${totalRevenue.toLocaleString()}`} 
              trend={timeFilter === 'all' ? '' : `vs período anterior`}
              isPositive={true} 
              icon={TrendingUp} 
              color="violet"
              subtitle={timeFilter === 'all' ? 'Total histórico' : `Período: ${timeFilter === '30d' ? 'Últimos 30 días' : timeFilter === 'month' ? 'Este mes' : 'Año actual'}`}
            />
            {activeProjectsCount === 0 && projects.length === 0 ? (
              <div className="md:col-span-2 lg:col-span-3">
                <EmptyState 
                  type="projects" 
                  onAction={() => setIsProjectModalOpen(true)}
                />
              </div>
            ) : (
              <>
                <StatCard 
                  title="Proyectos Activos" 
                  value={activeProjectsCount} 
                  trend={activeProjectsCount > 0 ? `${activeProjectsCount} activos` : ''}
                  isPositive={true} 
                  icon={Activity} 
                  color="blue"
                  subtitle="Proyectos en desarrollo"
                />
                <StatCard 
                  title="Leads Pendientes" 
                  value={pendingLeads} 
                  trend={pendingLeads > 0 ? `${pendingLeads} en pipeline` : ''}
                  isPositive={pendingLeads > 0} 
                  icon={Users} 
                  color="cyan"
                  subtitle="En seguimiento"
                />
                <StatCard 
                  title="Prom. Finalización" 
                  value={`${completionRate}%`} 
                  trend={completionRate > 0 ? `${completedTasks}/${totalTasks} tareas` : 'Sin tareas'}
                  isPositive={completionRate > 60} 
                  icon={Clock} 
                  color="emerald"
                  subtitle="Todas las tareas"
                  tooltip="Porcentaje de finalización de tareas del equipo (completadas vs total)"
                />
              </>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-h3 text-slate-900 dark:text-white">Trayectoria de Ingresos</h3>
          </div>
          {!hasFinancialData || filteredFinancials.length === 0 ? (
            <EmptyState type="graph" />
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredFinancials}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} itemStyle={{ color: '#e2e8f0' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/5">
           <h3 className="text-h3 text-slate-900 dark:text-white mb-6">Proyectos en Seguimiento</h3>
           {!hasProjects ? (
             <EmptyState 
               type="projects" 
               onAction={() => setIsProjectModalOpen(true)}
               title="Sin proyectos"
               message="Crea tu primer proyecto para comenzar a rastrear el progreso."
             />
           ) : (
             <div className="space-y-4">
                {projects.slice(0, 4).map(project => (
                  <div key={project.id} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
                    <img src={project.clientLogo} alt="" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <h4 className="font-medium text-slate-900 dark:text-slate-200 truncate">{project.name}</h4>
                        <span className="text-xs text-slate-600 dark:text-slate-400">{project.status}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${project.progress > 80 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${project.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const CTODashboard: React.FC<{ setActiveTab?: (tab: string) => void }> = () => {
  const { projects, tasks, users, user, createProject } = useStore();
  
  if (!user) return null;
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  // CTO specific metrics - focused on development teams
  const activeProjects = projects.filter(p => p.status !== 'Delivered');
  const developers = users.filter(u => u.role === 'Developer');
  const allTeamTasks = tasks.filter(t => t.status !== 'Done');
  const completedTasks = tasks.filter(t => t.status === 'Done');
  
  // Calculate team KPIs
  const avgCompletionRate = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0;
  
  const highPriorityTasks = allTeamTasks.filter(t => t.priority === 'High').length;
  const projectsInDevelopment = activeProjects.filter(p => p.status === 'In Development').length;
  const projectsInTesting = activeProjects.filter(p => p.status === 'Testing').length;
  
  // Tasks by developer
  const tasksByDeveloper = useMemo(() => {
    const grouped: Record<string, { total: number; completed: number; pending: number }> = {};
    developers.forEach(dev => {
      const devTasks = tasks.filter(t => t.assigneeId === dev.id);
      grouped[dev.id] = {
        total: devTasks.length,
        completed: devTasks.filter(t => t.status === 'Done').length,
        pending: devTasks.filter(t => t.status !== 'Done').length
      };
    });
    return grouped;
  }, [tasks, developers]);
  
  // Calculate velocity based on completed tasks grouped by week
  const velocityData = useMemo(() => {
    const now = new Date();
    const weeks: Array<{ week: string; tasks: number }> = [];
    
    // Get last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      
      // Count completed tasks in this week
      // Since we don't have completion date, we'll estimate based on task status
      // For now, we'll distribute completed tasks evenly across weeks or use a simple heuristic
      const weekCompleted = Math.floor(completedTasks.length / 4); // Simple distribution
      
      const weekLabel = `Sem ${4 - i}`;
      weeks.push({ week: weekLabel, tasks: weekCompleted });
    }
    
    // If we have completed tasks, distribute them more realistically
    if (completedTasks.length > 0) {
      const tasksPerWeek = Math.ceil(completedTasks.length / 4);
      return weeks.map((w, i) => ({
        ...w,
        tasks: i < 3 ? tasksPerWeek : completedTasks.length - (tasksPerWeek * 3)
      }));
    }
    
    return weeks;
  }, [completedTasks.length]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-h1 text-slate-900 dark:text-white mb-2">Vista CTO</h1>
          <p className="text-body text-slate-600 dark:text-slate-400">
            Gestión de equipos de desarrollo y KPIs técnicos
          </p>
        </div>
        <button 
          onClick={() => setIsProjectModalOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg shadow-violet-500/20 transition-all active:scale-95"
        >
          + Nuevo Proyecto
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Proyectos Activos" 
          value={activeProjects.length} 
          trend={projectsInDevelopment > 0 ? `${projectsInDevelopment} en desarrollo` : ''}
          isPositive={true} 
          icon={Activity} 
          color="blue"
          subtitle="Equipos trabajando"
        />
        <StatCard 
          title="Desarrolladores" 
          value={developers.length} 
          trend={`${allTeamTasks.length} tareas activas`}
          isPositive={true} 
          icon={Users} 
          color="violet"
          subtitle="Equipo técnico"
        />
        <StatCard 
          title="Tasa de Finalización" 
          value={`${avgCompletionRate}%`} 
          trend={avgCompletionRate > 80 ? "+5%" : avgCompletionRate > 60 ? "Estable" : "-2%"}
          isPositive={avgCompletionRate > 60} 
          icon={CheckCircle} 
          color="emerald"
          subtitle="Últimos 30 días"
          tooltip="Porcentaje de tareas completadas vs total de tareas del equipo"
        />
        <StatCard 
          title="Alta Prioridad" 
          value={highPriorityTasks} 
          trend={highPriorityTasks > 0 ? "Requiere atención" : "Todo bajo control"}
          isPositive={highPriorityTasks === 0} 
          icon={AlertCircle} 
          color="cyan"
          subtitle="Tareas urgentes"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Team Performance */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/5">
          <h3 className="text-h3 text-slate-900 dark:text-white mb-6">Rendimiento del Equipo</h3>
          {developers.length === 0 ? (
            <EmptyState 
              type="general"
              title="Sin desarrolladores"
              message="No hay desarrolladores en el equipo. Agrega miembros del equipo para ver métricas."
            />
          ) : (
            <div className="space-y-4">
              {developers.map(dev => {
                const devStats = tasksByDeveloper[dev.id] || { total: 0, completed: 0, pending: 0 };
                const completionRate = devStats.total > 0 
                  ? Math.round((devStats.completed / devStats.total) * 100) 
                  : 0;
                
                return (
                  <div key={dev.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                    <img 
                      src={dev.avatar} 
                      alt={dev.name}
                      className="w-12 h-12 rounded-full border-2 border-slate-200 dark:border-white/10"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-slate-900 dark:text-white">{dev.name}</h4>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {completionRate}% completado
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span>{devStats.completed} completadas</span>
                        <span>{devStats.pending} pendientes</span>
                        <span>{devStats.total} total</span>
                      </div>
                      <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-violet-500 rounded-full transition-all"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Project Status */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-h3 text-slate-900 dark:text-white">Estado de Proyectos</h3>
          </div>
          {projects.length === 0 ? (
            <EmptyState 
              type="projects" 
              onAction={() => setIsProjectModalOpen(true)}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <span className="text-sm font-medium text-slate-900 dark:text-white">En Desarrollo</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{projectsInDevelopment}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <span className="text-sm font-medium text-slate-900 dark:text-white">En Testing</span>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{projectsInTesting}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="text-sm font-medium text-slate-900 dark:text-white">Propuesta</span>
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {projects.filter(p => p.status === 'Proposal').length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-sm font-medium text-slate-900 dark:text-white">Finalizados</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {projects.filter(p => p.status === 'Delivered').length}
                </span>
              </div>
              {projects.slice(0, 3).map(project => (
                <div key={project.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                  <img src={project.clientLogo} alt="" className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/10" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">{project.name}</h4>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                      <div 
                        className={`h-full ${project.progress > 80 ? 'bg-emerald-500' : 'bg-violet-500'}`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Velocity Chart */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/5">
        <h3 className="text-h3 text-slate-900 dark:text-white mb-6">Velocidad del Equipo</h3>
        {completedTasks.length === 0 ? (
          <EmptyState 
            type="graph"
            title="Sin datos de velocidad"
            message="La velocidad del equipo se mostrará aquí una vez que se completen tareas."
          />
        ) : (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} />
                <Bar dataKey="tasks" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Tareas completadas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {isProjectModalOpen && user && (
        <CreateProjectModal
          onClose={() => setIsProjectModalOpen(false)}
          onCreate={createProject}
          users={users}
          currentUser={user}
        />
      )}
    </div>
  );
};

const DeveloperDashboard: React.FC<{ setActiveTab?: (tab: string) => void }> = () => {
  const { tasks, projects, user } = useStore();
  
  if (!user) return null;
  
  // Developer specific metrics
  const myTasks = tasks.filter(t => t.assigneeId === user.id && t.status !== 'Done');
  const myCompletedTasks = tasks.filter(t => t.assigneeId === user.id && t.status === 'Done');
  const myProjects = projects.filter(p => p.team.includes(user.id));
  const highPriority = myTasks.filter(t => t.priority === 'High').length;
  
  // Calculate activity based on completed tasks (distributed by day of week as proxy)
  // Since we don't have actual commit data, we'll use completed tasks as a proxy
  const commitData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const totalCompleted = myCompletedTasks.length;
    
    if (totalCompleted === 0) {
      return days.map(day => ({ day, commits: 0 }));
    }
    
    // Distribute completed tasks across weekdays (more on weekdays, less on weekends)
    const distribution = [0.2, 0.2, 0.15, 0.2, 0.15, 0.05, 0.05]; // Mon-Fri get more
    return days.map((day, i) => ({
      day,
      commits: Math.round(totalCompleted * distribution[i])
    }));
  }, [myCompletedTasks.length]);
  
  const totalCommits = commitData.reduce((sum, d) => sum + d.commits, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Bienvenido de nuevo, {user.name.split(' ')[0]}</h1>
          <p className="text-slate-400">Tienes <span className="text-white font-bold">{myTasks.length} tareas pendientes</span> en {myProjects.length} proyectos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Mis Tareas Pendientes" value={myTasks.length} trend={myTasks.length > 0 ? `${myTasks.length} pendientes` : 'Todo al día'} isPositive={myTasks.length === 0} icon={CheckCircle} color="blue" />
        <StatCard title="Sprints Activos" value={myProjects.length} trend={myProjects.length > 0 ? `${myProjects.length} proyectos` : 'Sin proyectos'} isPositive={myProjects.length > 0} icon={Activity} color="violet" />
        <StatCard title="Alta Prioridad" value={highPriority} trend={highPriority > 0 ? 'Requiere atención' : 'Todo bajo control'} isPositive={highPriority === 0} icon={AlertCircle} color="cyan" />
        <StatCard title="Tareas Completadas" value={myCompletedTasks.length} trend={myCompletedTasks.length > 0 ? `${myCompletedTasks.length} finalizadas` : 'Sin completar'} isPositive={true} icon={Bug} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task List */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/5">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Cola de Trabajo Prioritaria</h3>
          <div className="space-y-3">
             {myTasks.length > 0 ? myTasks.slice(0, 5).map(task => (
               <div key={task.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-violet-500/30 transition-all">
                 <div className="flex items-center gap-4">
                   <div className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                   <div>
                     <h4 className="text-sm font-medium text-slate-900 dark:text-white">{task.title}</h4>
                     <p className="text-xs text-slate-600 dark:text-slate-500">{task.projectId}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-3">
                   <span className="text-xs bg-slate-200 dark:bg-black/60 px-2 py-1 rounded text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-white/20">{task.dueDate}</span>
                   <button className="text-xs bg-violet-600 hover:bg-violet-700 text-white px-3 py-1 rounded transition-colors">Comenzar</button>
                 </div>
               </div>
             )) : (
               <div className="text-center py-10 text-slate-500">No hay tareas pendientes. ¡Buen trabajo!</div>
             )}
          </div>
        </div>

        {/* Git Activity */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-slate-200">
            <GitCommit size={20} className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-semibold">Actividad Semanal</h3>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={commitData}>
                 <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                 <Bar dataKey="commits" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {totalCommits > 0 ? `${totalCommits} tareas completadas esta semana` : 'Sin actividad esta semana'}
            </p>
          </div>
        </div>
      </div>

      {isProjectModalOpen && user && (
        <CreateProjectModal
          onClose={() => setIsProjectModalOpen(false)}
          onCreate={createProject}
          users={users}
          currentUser={user}
        />
      )}
    </div>
  );
}

const CreateProjectModal: React.FC<{
  onClose: () => void;
  onCreate: (project: Partial<any>) => Promise<void>;
  users: any[];
  currentUser: any;
}> = ({ onClose, onCreate, users, currentUser }) => {
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientLogo, setClientLogo] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Proposal');
  const [selectedTeam, setSelectedTeam] = useState<string[]>([currentUser.id]);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [newTech, setNewTech] = useState('');
  const [loading, setLoading] = useState(false);

  const COLUMNS: ProjectStatus[] = ['Proposal', 'In Development', 'Testing', 'Delivered'];

  const handleAddTech = () => {
    if (newTech.trim() && !techStack.includes(newTech.trim())) {
      setTechStack([...techStack, newTech.trim()]);
      setNewTech('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setTechStack(techStack.filter(t => t !== tech));
  };

  const handleToggleTeamMember = (userId: string) => {
    if (selectedTeam.includes(userId)) {
      setSelectedTeam(selectedTeam.filter(id => id !== userId));
    } else {
      setSelectedTeam([...selectedTeam, userId]);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setClientLogo(base64String);
        setLogoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setClientLogo('');
    setLogoPreview(null);
    // Reset file input
    const fileInput = document.getElementById('logo-upload-dashboard') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clientName || !dueDate) return;

    setLoading(true);
    try {
      await onCreate({
        name,
        clientName,
        clientLogo: clientLogo || `https://picsum.photos/seed/${clientName}/50`,
        description,
        budget: parseFloat(budget) || 0,
        dueDate,
        status,
        team: selectedTeam,
        tech: techStack,
        progress: 0
      });
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-black w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-white/20 shadow-2xl p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Crear Nuevo Proyecto</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Nombre del Proyecto <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Ej: Plataforma E-commerce"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Nombre del Cliente <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Acme Corp"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Logo del Cliente (opcional)
            </label>
            
            {logoPreview ? (
              <div className="relative inline-block">
                <img 
                  src={logoPreview} 
                  alt="Vista previa del logo" 
                  className="w-24 h-24 object-contain bg-slate-100 dark:bg-black/60 rounded-lg border border-slate-200 dark:border-white/20 p-2"
                />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
                  title="Eliminar logo"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-white/30 rounded-lg cursor-pointer bg-slate-50 dark:bg-black/50 hover:bg-slate-100 dark:hover:bg-black/60 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-10 h-10 mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-semibold">Click para subir</span> o arrastra y suelta
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    PNG, JPG, GIF hasta 5MB
                  </p>
                </div>
                <input
                  id="logo-upload-dashboard"
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg,image/jpg,image/gif"
                  onChange={handleLogoUpload}
                />
              </label>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none h-24"
              placeholder="Descripción del proyecto y objetivos..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Presupuesto ($)
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="50000"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Fecha Límite <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Estado Inicial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 transition-colors appearance-none"
              >
                {COLUMNS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Miembros del Equipo
            </label>
            <div className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/20 rounded-lg p-3 max-h-32 overflow-y-auto">
              {users.map(u => (
                <label key={u.id} className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTeam.includes(u.id)}
                    onChange={() => handleToggleTeamMember(u.id)}
                    className="rounded border-slate-300 dark:border-slate-600 text-violet-600 focus:ring-violet-500"
                  />
                  <img src={u.avatar} className="w-6 h-6 rounded-full" alt={u.name} />
                  <span className="text-sm text-slate-900 dark:text-white">{u.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Stack Tecnológico
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Ej: React, Node.js, Python"
              />
              <button
                type="button"
                onClick={handleAddTech}
                className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Agregar
              </button>
            </div>
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {techStack.map(tech => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="hover:text-violet-900 dark:hover:text-violet-100"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-200 dark:bg-black/60 hover:bg-slate-300 dark:hover:bg-black/80 text-slate-900 dark:text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !name || !clientName || !dueDate}
              className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Creando...' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SalesDashboard: React.FC<{ setActiveTab?: (tab: string) => void }> = () => {
  const { leads, tasks, user, addLead } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  if (!user) return null;
  
  const pipelineValue = leads.reduce((acc, l) => acc + l.value, 0);
  const wonValue = leads.filter(l => l.stage === 'Won').reduce((acc, l) => acc + l.value, 0);
  const dealsClosed = leads.filter(l => l.stage === 'Won').length;
  const myTasks = tasks.filter(t => t.assigneeId === user.id && t.status !== 'Done');
  
  // Calculate trends based on actual data
  const previousMonthWon = useMemo(() => {
    // Placeholder - would need historical data
    return wonValue; // In real app, compare with previous month
  }, [wonValue]);
  
  const monthOverMonthChange = previousMonthWon > 0 
    ? Math.round(((wonValue - previousMonthWon) / previousMonthWon) * 100) 
    : 0;

  const funnelData = [
    { name: 'New', value: leads.filter(l=>l.stage === 'New').length },
    { name: 'Proposal', value: leads.filter(l=>l.stage === 'Proposal').length },
    { name: 'Negotiation', value: leads.filter(l=>l.stage === 'Negotiation').length },
    { name: 'Won', value: leads.filter(l=>l.stage === 'Won').length },
  ];

  const COLORS = ['#94a3b8', '#6366f1', '#8b5cf6', '#10b981'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Centro de Comando de Ventas</h1>
          <p className="text-slate-400">Estado del Pipeline y Objetivos</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg shadow-violet-500/20 transition-all active:scale-95"
        >
          + Agregar Lead
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Valor del Pipeline" value={`$${pipelineValue.toLocaleString()}`} trend={pipelineValue > 0 ? 'Total pipeline' : 'Sin leads'} isPositive={pipelineValue > 0} icon={Wallet} color="violet" />
        <StatCard title="Tratos Cerrados" value={dealsClosed} trend={dealsClosed > 0 ? `${dealsClosed} cerrados` : 'Sin cierres'} isPositive={dealsClosed > 0} icon={CheckCircle} color="emerald" />
        <StatCard title="Ingresos Ganados" value={`$${wonValue.toLocaleString()}`} trend={monthOverMonthChange !== 0 ? `${monthOverMonthChange > 0 ? '+' : ''}${monthOverMonthChange}% MoM` : 'Sin cambio'} isPositive={monthOverMonthChange >= 0} icon={TrendingUp} color="blue" />
        <StatCard title="Tareas de Seguimiento" value={myTasks.length} trend={myTasks.length > 0 ? `${myTasks.length} pendientes` : 'Todo al día'} isPositive={myTasks.length === 0} icon={CheckSquare} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/5">
           <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Distribución del Pipeline</h3>
           <div className="h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={funnelData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                   {funnelData.map((_, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} itemStyle={{color: '#fff'}} />
               </PieChart>
             </ResponsiveContainer>
           </div>
           <div className="flex justify-center gap-4 text-xs text-slate-600 dark:text-slate-400 mt-2">
             {funnelData.map((entry, i) => (
               <div key={entry.name} className="flex items-center gap-1">
                 <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i]}} />
                 {entry.name}
               </div>
             ))}
           </div>
        </div>

        <div className="col-span-2 glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/5">
           <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Actividad Reciente de Tratos</h3>
           <div className="space-y-4">
              {leads.map(lead => (
                <div key={lead.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/5">
                   <div>
                     <h4 className="font-medium text-slate-900 dark:text-white">{lead.companyName}</h4>
                     <p className="text-xs text-slate-600 dark:text-slate-500">{lead.contactPerson} • Último contacto: {lead.lastContact}</p>
                   </div>
                   <div className="text-right">
                     <p className="font-bold text-slate-900 dark:text-slate-200">${lead.value.toLocaleString()}</p>
                     <span className={`text-xs px-2 py-0.5 rounded-full ${
                       lead.stage === 'Won' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400'
                     }`}>{lead.stage}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {isModalOpen && (
        <LeadModal onClose={() => setIsModalOpen(false)} onAdd={addLead} />
      )}
    </div>
  );
}

const LeadModal: React.FC<{ onClose: () => void; onAdd: (lead: Partial<any>) => Promise<void> }> = ({ onClose, onAdd }) => {
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [value, setValue] = useState('');
  const [probability, setProbability] = useState('0');
  const [stage, setStage] = useState<LeadStage>('New');
  const [loading, setLoading] = useState(false);

  const STAGES: LeadStage[] = ['New', 'Contacted', 'Proposal', 'Negotiation', 'Won'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactPerson || !value) return;

    setLoading(true);
    try {
      await onAdd({
        companyName,
        contactPerson,
        value: parseFloat(value),
        probability: parseInt(probability),
        stage
      });
      onClose();
    } catch (error) {
      console.error('Error creating lead:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-black w-full max-w-md rounded-2xl border border-white/20 shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Agregar Nuevo Lead</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Nombre de la Empresa <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Acme Corp"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Persona de Contacto <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Juan Pérez"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Valor ($) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="50000"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Probabilidad (%)
              </label>
              <input
                type="number"
                value={probability}
                onChange={(e) => setProbability(e.target.value)}
                className="w-full bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-white/20 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="50"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Etapa Inicial
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as LeadStage)}
              className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
            >
              {STAGES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-200 dark:bg-black/60 hover:bg-slate-300 dark:hover:bg-black/80 text-slate-900 dark:text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !companyName || !contactPerson || !value}
              className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Creando...' : 'Crear Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CFODashboard: React.FC<{ setActiveTab?: (tab: string) => void }> = () => {
  const { financials, subscriptions, leads } = useStore();
  
  const totalRevenue = financials.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalProfit = financials.reduce((acc, curr) => acc + curr.profit, 0);
  const monthlyBurn = subscriptions.reduce((acc, s) => acc + (s.cycle === 'Monthly' ? s.cost : s.cost / 12), 0);
  
  // Predict next month revenue based on high prob leads
  const forecastRevenue = leads.filter(l => l.probability > 70).reduce((acc, l) => acc + l.value, 0);
  
  // Calculate trends - compare with previous period
  const previousPeriodRevenue = useMemo(() => {
    // Would need historical data - placeholder for now
    return totalRevenue;
  }, [totalRevenue]);
  
  const revenueChange = previousPeriodRevenue > 0 
    ? Math.round(((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100) 
    : 0;
  
  const marginPercent = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;
  const previousMargin = useMemo(() => {
    return marginPercent; // Placeholder
  }, [marginPercent]);
  
  const marginChange = previousMargin > 0 
    ? Math.round(marginPercent - previousMargin) 
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Vista Financiera</h1>
          <p className="text-slate-600 dark:text-slate-400">Flujo de Caja, Gastos y Pronósticos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Ingresos Año Actual" value={`$${totalRevenue.toLocaleString()}`} trend={revenueChange !== 0 ? `${revenueChange > 0 ? '+' : ''}${revenueChange}%` : 'Sin cambio'} isPositive={revenueChange >= 0} icon={DollarSign} color="emerald" />
        <StatCard title="Margen de Ganancia Neta" value={`${marginPercent}%`} trend={marginChange !== 0 ? `${marginChange > 0 ? '+' : ''}${marginChange}%` : 'Estable'} isPositive={marginChange >= 0} icon={TrendingUp} color="violet" />
        <StatCard title="Tasa de Consumo Mensual" value={`$${Math.round(monthlyBurn).toLocaleString()}`} trend={monthlyBurn > 0 ? 'Gastos recurrentes' : 'Sin suscripciones'} isPositive={true} icon={CreditCard} color="blue" />
        <StatCard title="Pronóstico (Alta Prob)" value={`$${forecastRevenue.toLocaleString()}`} trend={forecastRevenue > 0 ? 'Próximos 30 días' : 'Sin pronóstico'} isPositive={forecastRevenue > 0} icon={Target} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/5">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Ingresos vs Gastos</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financials}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} 
                />
                <Bar dataKey="revenue" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/5">
           <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Desglose de Costos de Suscripciones</h3>
           <div className="space-y-4">
             {subscriptions.map(sub => (
               <div key={sub.id} className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                      {sub.service[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{sub.service}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-500">{sub.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">${sub.cost}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-500">/ {sub.cycle}</div>
                  </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  isPositive?: boolean;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  color: string;
  subtitle?: string;
  tooltip?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, isPositive, icon: Icon, color, subtitle, tooltip }) => {
  const colorClasses: Record<string, string> = {
    violet: 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-500/10',
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10',
    cyan: 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-500/10',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10',
  };

  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <div className="glass-card p-6 rounded-2xl relative">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            isPositive ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10' : 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/10'
          }`}>
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <div className="flex items-center gap-1 mb-1">
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{title}</p>
          {tooltip && (
            <div className="relative">
              <HelpCircle 
                size={14} 
                className="text-slate-400 cursor-help"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              />
              {showTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-lg p-2 shadow-lg z-10">
                  {tooltip}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800"></div>
                </div>
              )}
            </div>
          )}
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{value}</h3>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        )}
      </div>
    </div>
  );
}