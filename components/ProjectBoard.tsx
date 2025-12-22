import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { ProjectStatus, Project, TechStack } from '../types';
import { Calendar, MoreVertical, Plus, Edit3, Trash2, X, Save, FileText } from 'lucide-react';

const COLUMNS: ProjectStatus[] = ['Proposal', 'In Development', 'Testing', 'Delivered'];

export const ProjectBoard: React.FC = () => {
  const { projects, updateProjectStatus, updateProjectDetails, deleteProject, createProject, user, users } = useStore();
  
  if (!user) return null;

  // Menu State
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Edit Modal State
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState({ progress: 0, notes: '' });

  // Create Project Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const visibleProjects = React.useMemo(() => {
    if (user.role === 'Developer') {
      return projects.filter(p => p.team.includes(user.id));
    }
    return projects;
  }, [projects, user]);

  const canCreateProject = user.role === 'Founder' || user.role === 'CTO' || user.role === 'Sales';

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    e.dataTransfer.setData('projectId', projectId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: ProjectStatus) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('projectId');
    if (projectId) {
      updateProjectStatus(projectId, status);
    }
  };

  // Menu Handlers
  const toggleMenu = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === projectId ? null : projectId);
  };

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setEditForm({ 
      progress: project.progress, 
      notes: project.managerNotes || '' 
    });
    setActiveMenu(null);
  };

  const handleDeleteClick = (projectId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      deleteProject(projectId);
    }
    setActiveMenu(null);
  };

  const saveProjectDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      updateProjectDetails(editingProject.id, {
        progress: editForm.progress,
        managerNotes: editForm.notes
      });
      setEditingProject(null);
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-center mb-6 px-1">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tablero de Proyectos</h2>
        <div className="flex gap-3">
          <button className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium">Filtrar</button>
          {canCreateProject && (
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <Plus size={16} /> Nuevo Proyecto
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
          {COLUMNS.map((status) => (
            <div 
              key={status} 
              className="flex flex-col bg-slate-100 dark:bg-black/30 rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-sm"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center sticky top-0 bg-white/80 dark:bg-black/90 backdrop-blur-xl rounded-t-2xl z-10">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'Proposal' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' :
                    status === 'In Development' ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]' :
                    status === 'Testing' ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]' :
                    'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                  }`} />
                  <span className="font-semibold text-sm text-slate-700 dark:text-white">{status}</span>
                  <span className="bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-white text-xs px-2 py-0.5 rounded-full">
                    {visibleProjects.filter(p => p.status === status).length}
                  </span>
                </div>
              </div>

              <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                {visibleProjects.filter(p => p.status === status).map((project) => (
                  <div
                    key={project.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, project.id)}
                    className="glass-card p-4 rounded-xl cursor-grab active:cursor-grabbing hover:shadow-xl hover:shadow-violet-500/5 group relative bg-white dark:bg-transparent"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <img src={project.clientLogo} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5" alt="client" />
                      
                      <div className="relative">
                        <button 
                          onClick={(e) => toggleMenu(e, project.id)}
                          className={`text-slate-600 hover:text-slate-900 dark:hover:text-white transition-all p-1 rounded-md hover:bg-slate-200 dark:hover:bg-white/5 ${activeMenu === project.id ? 'opacity-100 text-slate-900 dark:text-white' : 'opacity-0 group-hover:opacity-100'}`}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenu === project.id && (
                          <div ref={menuRef} className="absolute right-0 top-6 w-36 bg-white dark:bg-black border border-slate-200 dark:border-white/20 rounded-lg shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                            <button 
                              onClick={() => handleEditClick(project)}
                              className="w-full text-left px-3 py-2 text-xs text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white flex items-center gap-2"
                            >
                              <Edit3 size={12} /> Editar / Notas
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(project.id)}
                              className="w-full text-left px-3 py-2 text-xs text-red-500 dark:text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                            >
                              <Trash2 size={12} /> Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <h4 className="font-semibold text-slate-800 dark:text-white mb-1">{project.name}</h4>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">{project.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 dark:text-white/80 font-medium">Progreso</span>
                        <span className={`font-bold ${project.progress === 100 ? 'text-emerald-500' : 'text-violet-500'}`}>{project.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-black/60 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ease-out ${
                            project.progress === 100 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-emerald-400 dark:to-teal-300' 
                            : 'bg-gradient-to-r from-violet-600 to-indigo-400 dark:from-violet-500 dark:to-indigo-300'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/5">
                      <div className="flex -space-x-2">
                        {project.team.map((userId) => (
                          <img 
                            key={userId} 
                            src={`https://picsum.photos/seed/${userId}/30`} 
                            className="w-6 h-6 rounded-full border border-white dark:border-slate-900" 
                            alt="team" 
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        {project.managerNotes && (
                           <div className="text-violet-500 dark:text-violet-400" title="Has Manager Notes">
                              <FileText size={14} />
                           </div>
                        )}
                        <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md ${
                          new Date(project.dueDate) < new Date() ? 'bg-red-500/10 text-red-500 dark:text-red-400' : 'bg-slate-200 dark:bg-black/30 text-slate-500 dark:text-white/80'
                        }`}>
                          <Calendar size={12} />
                          {new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-black w-full max-w-lg rounded-2xl border border-slate-200 dark:border-white/20 shadow-2xl p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Editar Estado: <span className="text-violet-600 dark:text-violet-400">{editingProject.name}</span>
                </h3>
                <p className="text-slate-500 dark:text-white/80 text-sm">Actualiza el progreso y deja notas para el equipo.</p>
              </div>
              <button onClick={() => setEditingProject(null)} className="text-slate-400 dark:text-white hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 p-1 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveProjectDetails} className="space-y-6">
              
              {/* Custom Designed Progress Slider */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <label className="text-sm font-semibold text-slate-700 dark:text-white">Finalización del Proyecto</label>
                  <span className="text-3xl font-bold text-violet-600 dark:text-violet-400">{editForm.progress}%</span>
                </div>
                
                <div className="relative w-full h-6 flex items-center">
                    {/* Track */}
                    <div className="absolute w-full h-3 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-75 ease-out ${
                              editForm.progress === 100
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-emerald-400 dark:to-teal-300'
                                : 'bg-gradient-to-r from-violet-600 to-indigo-400 dark:from-violet-500 dark:to-indigo-300'
                            }`}
                            style={{ width: `${editForm.progress}%` }}
                        />
                    </div>

                    {/* Thumb (Visual Only) */}
                    <div 
                        className={`absolute h-6 w-6 border-4 rounded-full shadow-lg pointer-events-none transition-all duration-75 ease-out flex items-center justify-center ${
                          editForm.progress === 100
                            ? 'bg-white dark:bg-slate-800 border-emerald-500 dark:border-emerald-400'
                            : 'bg-white dark:bg-slate-800 border-violet-600 dark:border-violet-500'
                        }`}
                        style={{ left: `calc(${editForm.progress}% - 12px)` }}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          editForm.progress === 100
                            ? 'bg-emerald-500 dark:bg-emerald-400'
                            : 'bg-violet-600 dark:bg-violet-500'
                        }`} />
                    </div>

                    {/* Actual Input (Invisible) */}
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={editForm.progress}
                      onChange={(e) => setEditForm({...editForm, progress: parseInt(e.target.value)})}
                      className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                    />
                </div>

                <div className="flex justify-between text-xs text-slate-400 dark:text-white/60 mt-4 font-medium px-1">
                  <span>Inicio</span>
                  <span>Cuarto</span>
                  <span>Mitad</span>
                  <span>Final</span>
                  <span>Listo</span>
                </div>
              </div>

              {/* Notes Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-white flex items-center gap-2">
                   <FileText size={16} className="text-emerald-500 dark:text-emerald-400" />
                   Notas del Gerente / Actualización de Estado
                </label>
                <textarea 
                  value={editForm.notes}
                  onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                  className="w-full h-32 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/20 rounded-xl p-4 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-violet-500 transition-colors resize-none placeholder-slate-400 dark:placeholder-slate-600 text-sm leading-relaxed"
                  placeholder="Deja una nota para los superiores sobre bloqueos, logros o próximos pasos..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingProject(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors font-medium text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20"
                >
                  <Save size={16} /> Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <CreateProjectModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={createProject}
          users={users}
          currentUser={user}
        />
      )}
    </div>
  );
};

const CreateProjectModal: React.FC<{
  onClose: () => void;
  onCreate: (project: Partial<Project>) => Promise<void>;
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
    const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
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
        tech: techStack as TechStack[],
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
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
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
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
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
                  id="logo-upload"
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
              className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none h-24"
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
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
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
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
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
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
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
                <label key={u.id} className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-black/60 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTeam.includes(u.id)}
                    onChange={() => handleToggleTeamMember(u.id)}
                    className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
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
                className="flex-1 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-2 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Ej: React, Node.js, Python"
              />
              <button
                type="button"
                onClick={handleAddTech}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Agregar
              </button>
            </div>
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {techStack.map(tech => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="hover:text-blue-900 dark:hover:text-blue-100"
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
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Creando...' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};