import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Briefcase, CheckSquare, Users, Clock, ArrowRight } from 'lucide-react';
import { useStore } from '../store';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const { projects, tasks, leads } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return { projects: [], tasks: [], leads: [] };

    const term = searchTerm.toLowerCase();
    
    const projectResults = projects
      .filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.clientName.toLowerCase().includes(term)
      )
      .slice(0, 5)
      .map(p => ({ ...p, type: 'project' as const }));

    const taskResults = tasks
      .filter(t => t.title.toLowerCase().includes(term))
      .slice(0, 5)
      .map(t => ({ ...t, type: 'task' as const }));

    const leadResults = leads
      .filter(l => 
        l.companyName.toLowerCase().includes(term) || 
        l.contactPerson.toLowerCase().includes(term)
      )
      .slice(0, 5)
      .map(l => ({ ...l, type: 'lead' as const }));

    return { projects: projectResults, tasks: taskResults, leads: leadResults };
  }, [searchTerm, projects, tasks, leads]);

  const allResults = useMemo(() => {
    return [
      ...searchResults.projects,
      ...searchResults.tasks,
      ...searchResults.leads
    ];
  }, [searchResults]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && allResults[selectedIndex]) {
        handleSelect(allResults[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allResults, selectedIndex, onClose]);

  const handleSelect = (item: any) => {
    if (item.type === 'project' && onNavigate) {
      onNavigate('projects');
    } else if (item.type === 'task' && onNavigate) {
      onNavigate('tasks');
    } else if (item.type === 'lead' && onNavigate) {
      onNavigate('leads');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-black w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-white/20 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-white/10">
          <Search className="text-slate-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar proyectos, tareas o leads..."
            className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-500 text-lg"
            autoFocus
          />
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {searchTerm.trim() === '' ? (
            <div className="p-8 text-center text-slate-500">
              <p className="text-sm">Escribe para buscar...</p>
              <p className="text-xs mt-2 text-slate-400">Presiona ⌘K para abrir este modal</p>
            </div>
          ) : allResults.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p className="text-sm">No se encontraron resultados</p>
            </div>
          ) : (
            <>
              {searchResults.projects.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Proyectos
                  </div>
                  {searchResults.projects.map((project, idx) => {
                    const globalIdx = searchResults.projects.slice(0, idx + 1).length - 1;
                    return (
                      <button
                        key={project.id}
                        onClick={() => handleSelect(project)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          selectedIndex === globalIdx
                            ? 'bg-violet-100 dark:bg-violet-500/20'
                            : 'hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <Briefcase className="text-violet-500 w-5 h-5" />
                        <div className="flex-1 text-left">
                          <div className="font-medium text-slate-900 dark:text-white">{project.name}</div>
                          <div className="text-xs text-slate-500">{project.clientName}</div>
                        </div>
                        <ArrowRight className="text-slate-400 w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              )}

              {searchResults.tasks.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Tareas
                  </div>
                  {searchResults.tasks.map((task, idx) => {
                    const globalIdx = searchResults.projects.length + idx;
                    return (
                      <button
                        key={task.id}
                        onClick={() => handleSelect(task)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          selectedIndex === globalIdx
                            ? 'bg-blue-100 dark:bg-blue-500/20'
                            : 'hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <CheckSquare className="text-blue-500 w-5 h-5" />
                        <div className="flex-1 text-left">
                          <div className="font-medium text-slate-900 dark:text-white">{task.title}</div>
                          <div className="text-xs text-slate-500">{task.dueDate}</div>
                        </div>
                        <ArrowRight className="text-slate-400 w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              )}

              {searchResults.leads.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Leads
                  </div>
                  {searchResults.leads.map((lead, idx) => {
                    const globalIdx = searchResults.projects.length + searchResults.tasks.length + idx;
                    return (
                      <button
                        key={lead.id}
                        onClick={() => handleSelect(lead)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          selectedIndex === globalIdx
                            ? 'bg-emerald-100 dark:bg-emerald-500/20'
                            : 'hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <Users className="text-emerald-500 w-5 h-5" />
                        <div className="flex-1 text-left">
                          <div className="font-medium text-slate-900 dark:text-white">{lead.companyName}</div>
                          <div className="text-xs text-slate-500">{lead.contactPerson}</div>
                        </div>
                        <ArrowRight className="text-slate-400 w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

