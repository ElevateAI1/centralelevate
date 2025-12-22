import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store';
import { CheckCircle2, Circle, AlertCircle, Clock, Briefcase, ChevronRight, X, User as UserIcon, Calendar, Plus, Trash2 } from 'lucide-react';
import { Task, Project, TaskPriority, TaskStatus } from '../types';
import { EmptyState } from './EmptyState';

export const TasksView: React.FC = () => {
  const { tasks, toggleTaskStatus, addTask, deleteTask, user, projects, users } = useStore();
  
  if (!user) return null;

  // Set default filter based on role
  const [filter, setFilter] = React.useState<'Todas' | 'Pendiente' | 'Completada'>('Todas');
  const [showMyTasksOnly, setShowMyTasksOnly] = React.useState(true);

  // Modal State
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Force "My Tasks Only" for non-admins on mount/role change
  useEffect(() => {
    if (user.role === 'Developer' || user.role === 'Sales') {
      setShowMyTasksOnly(true);
    } else {
      setShowMyTasksOnly(false); 
    }
  }, [user.role]);

  // Filter tasks first
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      // Role filter
      if (showMyTasksOnly && t.assigneeId !== user.id) return false;

      // Status filter
      if (filter === 'Todas') return true;
      if (filter === 'Pendiente') return t.status !== 'Done';
      if (filter === 'Completada') return t.status === 'Done';
      return true;
    });
  }, [tasks, showMyTasksOnly, filter, user.id]);

  // Group tasks by project
  const tasksByProject = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    filteredTasks.forEach(task => {
        if (!groups[task.projectId]) {
            groups[task.projectId] = [];
        }
        groups[task.projectId].push(task);
    });
    return groups;
  }, [filteredTasks]);

  const canSeeAllTasks = user.role === 'Founder' || user.role === 'CTO';
  const hasTasks = Object.keys(tasksByProject).length > 0;
  const hasAnyTasks = tasks.length > 0;

  // Quick add task form state
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [quickAddProjectId, setQuickAddProjectId] = useState('');
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddTitle.trim() || !quickAddProjectId) return;
    
    setIsQuickAdding(true);
    try {
      await addTask({
        title: quickAddTitle,
        projectId: quickAddProjectId,
        assigneeId: user.id,
        priority: 'Medium',
        status: 'Todo',
        dueDate: new Date().toISOString().split('T')[0]
      });
      setQuickAddTitle('');
      setQuickAddProjectId('');
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setIsQuickAdding(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-h2 text-slate-900 dark:text-white mb-1">
            {showMyTasksOnly ? 'Mis Tareas' : 'Tareas del Equipo'}
          </h2>
          <p className="text-body text-slate-500 dark:text-slate-400">
            {showMyTasksOnly 
              ? 'Organizadas por contexto del proyecto.' 
              : 'Vista general de todas las actividades de la agencia por proyecto.'}
          </p>
        </div>
        <button 
          onClick={() => setIsTaskModalOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-violet-500/20 flex items-center gap-2"
        >
          <Plus size={16} /> Nueva Tarea
        </button>
      </div>

      {/* Filters - Only show if there are tasks */}
      {hasAnyTasks && (
        <div className="bg-white dark:bg-black/40 rounded-2xl border border-slate-200 dark:border-white/10 p-2 mb-6 flex justify-between items-center transition-colors duration-200">
            <div className="flex gap-1">
              {(['Todas', 'Pendiente', 'Completada'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filter === f 
                      ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-500 dark:text-white/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {canSeeAllTasks && (
              <div className="flex items-center gap-2 pr-2">
                 <span className="text-xs text-slate-500 dark:text-white/80">Mostrar:</span>
                 <button 
                   onClick={() => setShowMyTasksOnly(!showMyTasksOnly)}
                   className="text-xs bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/20 px-3 py-1 rounded text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-black/80 transition-colors"
                 >
                   {showMyTasksOnly ? 'Mis Tareas' : 'Todos'}
                 </button>
              </div>
            )}
        </div>
      )}

      <div className="space-y-6">
        {!hasTasks ? (
            <div className="bg-white dark:bg-black/40 rounded-2xl border border-slate-200 dark:border-white/10 p-8">
              {!hasAnyTasks ? (
                <EmptyState 
                  type="tasks"
                  onAction={() => setIsTaskModalOpen(true)}
                />
              ) : (
                <>
                  <div className="text-center mb-6">
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                      No se encontraron tareas que coincidan con tus filtros.
                    </p>
                  </div>
                  {/* Quick Add Form */}
                  <form onSubmit={handleQuickAdd} className="bg-slate-50 dark:bg-black/60 rounded-xl p-4 border border-slate-200 dark:border-white/10">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Crear tarea rápida</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={quickAddTitle}
                        onChange={(e) => setQuickAddTitle(e.target.value)}
                        placeholder="Título de la tarea..."
                        className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/20 rounded-lg px-4 py-2 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                        required
                      />
                      <select
                        value={quickAddProjectId}
                        onChange={(e) => setQuickAddProjectId(e.target.value)}
                        className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/20 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 transition-colors"
                        required
                      >
                        <option value="">Seleccionar proyecto...</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        disabled={isQuickAdding || !quickAddTitle.trim() || !quickAddProjectId}
                        className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition-colors"
                      >
                        {isQuickAdding ? 'Creando...' : 'Crear Tarea'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
        ) : (
            Object.keys(tasksByProject).map(projectId => {
                const project = projects.find(p => p.id === projectId);
                const projectTasks = tasksByProject[projectId];
                
                // If we have tasks for a deleted project, handle gracefully
                const projectName = project ? project.name : `Proyecto ${projectId}`;
                const clientLogo = project ? project.clientLogo : 'https://picsum.photos/seed/unknown/50';
                
                return (
                    <div key={projectId} className="bg-white dark:bg-black/40 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                        {/* Project Header - Clickable */}
                        <div 
                          onClick={() => setViewingProject(project || null)}
                          className="p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group/header"
                        >
                            <div className="flex items-center gap-4">
                                <img src={clientLogo} alt="client" className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-white/10" />
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        {projectName}
                                        <div className="p-1 rounded-full bg-slate-200 dark:bg-white/10 group-hover/header:bg-violet-500 group-hover/header:text-white transition-colors">
                                            <ChevronRight size={14} />
                                        </div>
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Briefcase size={12} /> {project?.clientName || 'Cliente Desconocido'}
                                        </span>
                                        {project && (
                                            <span className={`px-2 py-0.5 rounded-full border ${
                                                project.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                            }`}>
                                                {project.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Team Avatars */}
                            {project && (
                                <div className="flex -space-x-2">
                                    {project.team.map(uid => (
                                        <img 
                                            key={uid}
                                            src={`https://picsum.photos/seed/${uid}/40`}
                                            alt={uid}
                                            title={users.find(u => u.id === uid)?.name}
                                            className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Task List */}
                        <div className="divide-y divide-slate-100 dark:divide-white/5">
                            {projectTasks.map(task => (
                                <div 
                                    key={task.id} 
                                    className={`flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group ${
                                    task.status === 'Done' ? 'opacity-60 bg-slate-50/50 dark:bg-black/30' : ''
                                    }`}
                                >
                                    <button 
                                    onClick={() => toggleTaskStatus(task.id)}
                                    className={`transition-colors transform active:scale-90 ${
                                        task.status === 'Done' ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500 hover:text-emerald-500'
                                    }`}
                                    >
                                    {task.status === 'Done' ? <CheckCircle2 size={22} className="fill-emerald-500/10" /> : <Circle size={22} />}
                                    </button>
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className={`text-sm font-medium ${
                                                task.status === 'Done' ? 'text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'
                                            }`}>
                                                {task.title}
                                            </h4>
                                            {task.priority === 'High' && task.status !== 'Done' && (
                                                <span className="flex items-center gap-1 text-[10px] bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-500/20 font-medium">
                                                    <AlertCircle size={10} /> Alta
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border ${
                                            new Date(task.dueDate) < new Date() && task.status !== 'Done' 
                                                ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-500/20' 
                                                : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-black/60 border-slate-200 dark:border-white/10'
                                        }`}>
                                            <Clock size={12} />
                                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </div>
                                        
                                        {!showMyTasksOnly && (
                                            <img 
                                                src={`https://picsum.photos/seed/${task.assigneeId}/40`} 
                                                className="w-7 h-7 rounded-full border border-slate-200 dark:border-white/10" 
                                                alt="assignee" 
                                                title={`Asignado a ${users.find(u => u.id === task.assigneeId)?.name}`}
                                            />
                                        )}
                                        <button
                                          onClick={async () => {
                                            if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
                                              try {
                                                await deleteTask(task.id);
                                              } catch (error) {
                                                alert('Error al eliminar la tarea');
                                              }
                                            }
                                          }}
                                          className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                          title="Eliminar tarea"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })
        )}
      </div>

      {/* Project Detail Modal */}
      {viewingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-black w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-white/20 shadow-2xl p-0 flex flex-col">
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 dark:border-white/10 sticky top-0 bg-white dark:bg-black z-10 flex justify-between items-start">
                    {/* Project Info */}
                    <div className="flex gap-4">
                        <img src={viewingProject.clientLogo} className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5" alt="client" />
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{viewingProject.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Briefcase size={14} /> {viewingProject.clientName}
                                <span className="mx-1">•</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    viewingProject.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                                }`}>
                                    {viewingProject.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setViewingProject(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Description & Stats */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 uppercase tracking-wider">Acerca de</h4>
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">{viewingProject.description}</p>
                        
                        <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-100 dark:border-white/5">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Estado de Finalización</span>
                                <span className="text-sm font-bold text-violet-600 dark:text-violet-400">{viewingProject.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                                <div className="bg-violet-600 dark:bg-violet-500 h-full rounded-full" style={{ width: `${viewingProject.progress}%` }} />
                            </div>
                            <div className="flex justify-between items-center mt-3 text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                    <Calendar size={12} /> Vence: {viewingProject.dueDate}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock size={12} /> Última actualización: {viewingProject.lastUpdate}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Team Grid */}
                    <div>
                         <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                            <UserIcon size={14} /> Miembros del Equipo
                         </h4>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                             {viewingProject.team.map(memberId => {
                                 const member = users.find(u => u.id === memberId);
                                 if (!member) return null;
                                 return (
                                     <div key={memberId} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                                         <img src={member.avatar} className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10" alt={member.name} />
                                         <div>
                                             <p className="text-sm font-medium text-slate-900 dark:text-white">{member.name}</p>
                                             <p className="text-xs text-slate-500">{member.role}</p>
                                         </div>
                                     </div>
                                 );
                             })}
                         </div>
                    </div>

                    {/* All Project Tasks */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                            <CheckCircle2 size={14} /> Tareas del Proyecto
                        </h4>
                        <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
                             {tasks.filter(t => t.projectId === viewingProject.id).length > 0 ? (
                                tasks.filter(t => t.projectId === viewingProject.id).map((task, idx) => (
                                     <div key={task.id} className={`flex items-center gap-3 p-3 ${idx !== 0 ? 'border-t border-slate-100 dark:border-white/5' : ''} hover:bg-slate-50 dark:hover:bg-white/[0.02]`}>
                                         <button onClick={() => toggleTaskStatus(task.id)} className={task.status === 'Done' ? 'text-emerald-500' : 'text-slate-300 hover:text-emerald-500'}>
                                             {task.status === 'Done' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                         </button>
                                         <div className="flex-1">
                                             <p className={`text-sm ${task.status === 'Done' ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{task.title}</p>
                                         </div>
                                         <div className="flex items-center gap-2">
                                             {task.assigneeId === user.id && (
                                                 <span className="text-[10px] bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 px-1.5 py-0.5 rounded">Tú</span>
                                             )}
                                             <img 
                                                src={users.find(u => u.id === task.assigneeId)?.avatar} 
                                                className="w-6 h-6 rounded-full opacity-70"
                                                title={users.find(u => u.id === task.assigneeId)?.name}
                                                alt="assignee"
                                             />
                                         </div>
                                     </div>
                                 ))
                             ) : (
                                 <div className="p-4 text-center text-sm text-slate-500">Aún no se han creado tareas para este proyecto.</div>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {isTaskModalOpen && (
        <TaskModal 
          onClose={() => setIsTaskModalOpen(false)} 
          onAdd={addTask}
          projects={projects}
          users={users}
          currentUser={user}
        />
      )}
    </div>
  );
};

const TaskModal: React.FC<{ 
  onClose: () => void; 
  onAdd: (task: Partial<Task>) => Promise<void>;
  projects: Project[];
  users: any[];
  currentUser: any;
}> = ({ onClose, onAdd, projects, users, currentUser }) => {
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [assigneeId, setAssigneeId] = useState(currentUser.id);
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !projectId) return;

    setLoading(true);
    try {
      await onAdd({
        title,
        projectId,
        assigneeId,
        priority,
        dueDate,
        status: 'Todo' as TaskStatus
      });
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-black w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/20 shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Crear Nueva Tarea</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Título de la Tarea <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Ej: Implementar autenticación de usuario"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Proyecto <span className="text-red-400">*</span>
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
              required
            >
              {projects.length === 0 ? (
                <option value="">No hay proyectos disponibles</option>
              ) : (
                projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Asignar A
            </label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
              >
                <option value="Low">Baja</option>
                <option value="Medium">Media</option>
                <option value="High">Alta</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Fecha Límite
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>
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
              disabled={loading || !title || !projectId}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Creando...' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};