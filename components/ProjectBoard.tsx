import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { ProjectStatus, Project, TechStack } from '../types';
import { Calendar, MoreVertical, Plus, Edit3, Trash2, X, Save, FileText, ExternalLink, Users, DollarSign, Code, Clock, Building2 } from 'lucide-react';

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

  // Project Details Modal State
  const [viewingProject, setViewingProject] = useState<Project | null>(null);

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

  const handleProjectClick = (project: Project, e: React.MouseEvent) => {
    // No abrir modal si se está haciendo click en el menú o si se está arrastrando
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[role="menu"]')) {
      return;
    }
    setViewingProject(project);
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
                    onClick={(e) => handleProjectClick(project, e)}
                    className="glass-card p-4 rounded-xl cursor-pointer hover:shadow-xl hover:shadow-violet-500/5 group relative bg-white dark:bg-transparent transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    title="Click para ver detalles"
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

      {/* Project Details Modal */}
      {viewingProject && (
        <ProjectDetailsModal
          project={viewingProject}
          users={users}
          onClose={() => setViewingProject(null)}
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
    if (!newTech.trim()) return;
    
    // Si hay comas, dividir y agregar todas las tecnologías
    if (newTech.includes(',')) {
      const techs = newTech
        .split(',')
        .map(tech => tech.trim())
        .filter(tech => tech && !techStack.includes(tech));
      
      if (techs.length > 0) {
        setTechStack([...techStack, ...techs]);
        setNewTech('');
      }
    } else {
      // Si no hay comas, agregar una sola tecnología (comportamiento original)
      const trimmedTech = newTech.trim();
      if (!techStack.includes(trimmedTech)) {
        setTechStack([...techStack, trimmedTech]);
        setNewTech('');
      }
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
                placeholder="Ej: React, Node.js, Python (separadas por comas)"
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

const ProjectDetailsModal: React.FC<{
  project: Project;
  users: any[];
  onClose: () => void;
}> = ({ project, users, onClose }) => {
  const { updateProjectDetails } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: project.name,
    clientName: project.clientName,
    clientLogo: project.clientLogo,
    description: project.description || '',
    budget: project.budget.toString(),
    dueDate: project.dueDate.split('T')[0],
    status: project.status,
    progress: project.progress,
    managerNotes: project.managerNotes || '',
    selectedTeam: [...project.team],
    techStack: [...(project.tech || [])],
    newTech: '',
    productUrl: project.productUrl || '',
    gitRepoUrl: project.gitRepoUrl || '',
    vercelUrl: project.vercelUrl || '',
    url: project.url || ''
  });

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'Proposal':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'In Development':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Testing':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Delivered':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
    }
  };

  const teamMembers = users.filter(u => formData.selectedTeam.includes(u.id));
  const isOverdue = new Date(formData.dueDate) < new Date();

  const handleAddTech = () => {
    if (!formData.newTech.trim()) return;
    if (formData.newTech.includes(',')) {
      const techs = formData.newTech
        .split(',')
        .map(tech => tech.trim())
        .filter(tech => tech && !formData.techStack.includes(tech as TechStack));
      if (techs.length > 0) {
        setFormData({ ...formData, techStack: [...formData.techStack, ...techs as TechStack[]], newTech: '' });
      }
    } else {
      const trimmedTech = formData.newTech.trim();
      if (!formData.techStack.includes(trimmedTech as TechStack)) {
        setFormData({ ...formData, techStack: [...formData.techStack, trimmedTech as TechStack], newTech: '' });
      }
    }
  };

  const handleRemoveTech = (tech: string) => {
    setFormData({ ...formData, techStack: formData.techStack.filter(t => t !== tech) });
  };

  const handleToggleTeamMember = (userId: string) => {
    if (formData.selectedTeam.includes(userId)) {
      setFormData({ ...formData, selectedTeam: formData.selectedTeam.filter(id => id !== userId) });
    } else {
      setFormData({ ...formData, selectedTeam: [...formData.selectedTeam, userId] });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProjectDetails(project.id, {
        name: formData.name,
        clientName: formData.clientName,
        clientLogo: formData.clientLogo,
        description: formData.description,
        budget: parseFloat(formData.budget) || 0,
        dueDate: formData.dueDate,
        status: formData.status,
        progress: formData.progress,
        managerNotes: formData.managerNotes,
        team: formData.selectedTeam,
        tech: formData.techStack,
        productUrl: formData.productUrl || undefined,
        gitRepoUrl: formData.gitRepoUrl || undefined,
        vercelUrl: formData.vercelUrl || undefined,
        url: formData.url || undefined
      });
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-black w-full max-w-4xl rounded-2xl border border-slate-200 dark:border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-black border-b border-slate-200 dark:border-white/10 p-6 rounded-t-2xl backdrop-blur-xl z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <img 
                src={formData.clientLogo} 
                className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 object-contain p-2" 
                alt={formData.clientName}
              />
              <div className="flex-1">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="text-2xl font-bold text-slate-900 dark:text-white mb-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/20 rounded-lg px-3 py-1 w-full"
                    />
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className="text-slate-500 dark:text-slate-400 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/20 rounded-lg px-3 py-1 w-full"
                      placeholder="Nombre del cliente"
                    />
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                      {formData.name}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
                      <Building2 size={14} />
                      {formData.clientName}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save size={16} />
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                    title="Editar proyecto"
                  >
                    <Edit3 size={20} />
                  </button>
                  <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Estado</span>
                {isEditing ? (
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                    className="px-3 py-1 rounded-full text-xs font-semibold border bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {COLUMNS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(formData.status)}`}>
                    {formData.status}
                  </span>
                )}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Progreso</span>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                      className="w-20 px-2 py-1 rounded text-sm font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-white/20"
                    />
                    <span className="text-sm">%</span>
                  </div>
                ) : (
                  <span className={`text-lg font-bold ${formData.progress === 100 ? 'text-emerald-500' : 'text-violet-500'}`}>
                    {formData.progress}%
                  </span>
                )}
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden mt-2">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    formData.progress === 100 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-emerald-400 dark:to-teal-300' 
                      : 'bg-gradient-to-r from-violet-600 to-indigo-400 dark:from-violet-500 dark:to-indigo-300'
                  }`}
                  style={{ width: `${formData.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-white mb-2">Descripción</h3>
            {isEditing ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none h-24"
                placeholder="Descripción del proyecto..."
              />
            ) : (
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{formData.description || 'Sin descripción'}</p>
            )}
          </div>

          {/* Key Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-2">
                <Calendar size={16} />
                <span className="text-sm font-medium">Fecha Límite</span>
              </div>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-1 rounded text-sm font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-white/20"
                />
              ) : (
                <p className={`text-sm font-semibold ${isOverdue ? 'text-red-500 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                  {new Date(formData.dueDate).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              )}
              {isOverdue && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">⚠️ Vencido</p>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-2">
                <DollarSign size={16} />
                <span className="text-sm font-medium">Presupuesto</span>
              </div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 dark:text-slate-400">$</span>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="flex-1 px-3 py-1 rounded text-lg font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-white/20"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              ) : (
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  ${parseFloat(formData.budget || '0').toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-2">
                <Clock size={16} />
                <span className="text-sm font-medium">Última Actualización</span>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {new Date(project.lastUpdate).toLocaleDateString('es-ES', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Team Members */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-white mb-3 flex items-center gap-2">
              <Users size={16} />
              Equipo ({teamMembers.length})
            </h3>
            {isEditing ? (
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/20 rounded-lg p-3 max-h-48 overflow-y-auto">
                {users.map(u => (
                  <label key={u.id} className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-black/60 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.selectedTeam.includes(u.id)}
                      onChange={() => handleToggleTeamMember(u.id)}
                      className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                    />
                    <img src={u.avatar} className="w-6 h-6 rounded-full" alt={u.name} />
                    <span className="text-sm text-slate-900 dark:text-white">{u.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {teamMembers.length > 0 ? teamMembers.map((member) => (
                  <div 
                    key={member.id}
                    className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10"
                  >
                    <img 
                      src={member.avatar} 
                      className="w-8 h-8 rounded-full border border-white dark:border-slate-800" 
                      alt={member.name}
                    />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{member.name}</span>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Sin miembros asignados</p>
                )}
              </div>
            )}
          </div>

          {/* Tech Stack */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-white mb-3 flex items-center gap-2">
              <Code size={16} />
              Stack Tecnológico
            </h3>
            {isEditing ? (
              <>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.newTech}
                    onChange={(e) => setFormData({ ...formData, newTech: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-2 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                    placeholder="Ej: React, Node.js, Python (separadas por comas)"
                  />
                  <button
                    type="button"
                    onClick={handleAddTech}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Agregar
                  </button>
                </div>
                {formData.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.techStack.map(tech => (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-800"
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
              </>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.techStack.length > 0 ? formData.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-800"
                  >
                    {tech}
                  </span>
                )) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Sin tecnologías asignadas</p>
                )}
              </div>
            )}
          </div>

          {/* Manager Notes */}
          <div className="bg-violet-50 dark:bg-violet-900/20 p-4 rounded-xl border border-violet-200 dark:border-violet-800">
            <h3 className="text-sm font-semibold text-violet-700 dark:text-violet-300 mb-2 flex items-center gap-2">
              <FileText size={16} />
              Notas del Gerente
            </h3>
            {isEditing ? (
              <textarea
                value={formData.managerNotes}
                onChange={(e) => setFormData({ ...formData, managerNotes: e.target.value })}
                className="w-full bg-white dark:bg-slate-900 border border-violet-200 dark:border-violet-800 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none h-32"
                placeholder="Notas del gerente sobre el proyecto..."
              />
            ) : (
              <p className="text-sm text-violet-600 dark:text-violet-300 leading-relaxed whitespace-pre-wrap">
                {formData.managerNotes || 'Sin notas'}
              </p>
            )}
          </div>

          {/* Links */}
          {(project.url || project.productUrl || project.gitRepoUrl || project.vercelUrl) && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-white mb-3 flex items-center gap-2">
                <ExternalLink size={16} />
                Enlaces
              </h3>
              <div className="flex flex-wrap gap-2">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">URL del Producto</label>
                      <input
                        type="url"
                        value={formData.productUrl}
                        onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-2 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                        placeholder="https://producto.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Repositorio Git</label>
                      <input
                        type="url"
                        value={formData.gitRepoUrl}
                        onChange={(e) => setFormData({ ...formData, gitRepoUrl: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-2 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                        placeholder="https://github.com/usuario/repo"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">URL de Vercel</label>
                      <input
                        type="url"
                        value={formData.vercelUrl}
                        onChange={(e) => setFormData({ ...formData, vercelUrl: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-2 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                        placeholder="https://proyecto.vercel.app"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">URL del Proyecto (Legacy)</label>
                      <input
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/20 rounded-lg px-4 py-2 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                        placeholder="https://proyecto.com"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {formData.productUrl && (
                      <a
                        href={formData.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-200 dark:border-emerald-800"
                      >
                        <ExternalLink size={14} />
                        Producto
                      </a>
                    )}
                    {formData.gitRepoUrl && (
                      <a
                        href={formData.gitRepoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
                      >
                        <ExternalLink size={14} />
                        Repositorio Git
                      </a>
                    )}
                    {formData.vercelUrl && (
                      <a
                        href={formData.vercelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity border border-slate-800 dark:border-slate-200"
                      >
                        <ExternalLink size={14} />
                        Vercel
                      </a>
                    )}
                    {formData.url && (
                      <a
                        href={formData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors border border-violet-200 dark:border-violet-800"
                      >
                        <ExternalLink size={14} />
                        Enlace del Proyecto
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Features */}
          {project.features && project.features.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-white mb-3">Características</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                {project.features.map((feature, index) => (
                  <li key={index} className="text-sm">{feature}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isEditing && (
          <div className="sticky bottom-0 bg-white dark:bg-black border-t border-slate-200 dark:border-white/10 p-4 rounded-b-2xl backdrop-blur-xl">
            <button
              onClick={onClose}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-2.5 rounded-xl transition-colors shadow-lg shadow-violet-500/20"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};