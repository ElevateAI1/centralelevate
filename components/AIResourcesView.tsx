import React, { useState } from 'react';
import { useStore } from '../store';
import { Search, Copy, Terminal, Image, MessageSquare, Zap, Plus, X } from 'lucide-react';
import { AIResource } from '../types';

export const AIResourcesView: React.FC = () => {
  const { aiResources, addAIResource, user } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredResources = aiResources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filter === 'Todos' || r.type === filter;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'Snippet': return <Terminal size={18} className="text-emerald-400" />;
      case 'ModelConfig': return <Image size={18} className="text-pink-400" />;
      default: return <MessageSquare size={18} className="text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-h2 text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="text-yellow-500 dark:text-yellow-400" fill="currentColor" /> Biblioteca de Recursos IA
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Prompts, configuraciones y fragmentos de código curados.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex gap-2 bg-slate-100 dark:bg-black/50 p-1 rounded-lg border border-slate-300 dark:border-white/20">
            {['Todos', 'Prompt', 'Snippet', 'ModelConfig'].map(f => (
               <button
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                   filter === f ? 'bg-violet-600 dark:bg-white/10 text-white dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                 }`}
               >
                 {f}
               </button>
            ))}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-violet-500/20 transition-all"
          >
            <Plus size={16} /> Agregar Recurso
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-3 text-slate-500 dark:text-slate-500 w-5 h-5" />
        <input 
          type="text"
          placeholder="Buscar por palabras clave, tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-white/20 rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(resource => (
          <div key={resource.id} className="glass-card p-5 rounded-2xl group hover:border-violet-500/30">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2 bg-slate-200 dark:bg-white/5 px-2 py-1 rounded-md border border-slate-300 dark:border-white/5">
                {getTypeIcon(resource.type)}
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{resource.type}</span>
              </div>
              <button 
                className="text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Copiar al portapapeles"
                onClick={() => navigator.clipboard.writeText(resource.content)}
              >
                <Copy size={16} />
              </button>
            </div>
            
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              {resource.title}
            </h3>
            
            <div className="bg-slate-100 dark:bg-black/30 p-3 rounded-lg border border-slate-300 dark:border-white/5 mb-4 relative overflow-hidden">
               <code className="text-xs text-slate-700 dark:text-slate-400 font-mono block truncate">
                 {resource.content}
               </code>
               <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-50 dark:from-[#0f1218] to-transparent"></div>
            </div>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex gap-2">
                {resource.tags.map(tag => (
                  <span key={tag} className="text-[10px] bg-slate-200 dark:bg-black/60 text-slate-700 dark:text-slate-400 px-2 py-0.5 rounded-full border border-slate-300 dark:border-white/20">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-500">
                ❤️ {resource.likes}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <AIResourceModal
          onClose={() => setIsModalOpen(false)}
          onAdd={addAIResource}
        />
      )}
    </div>
  );
};

const AIResourceModal: React.FC<{
  onClose: () => void;
  onAdd: (resource: Partial<AIResource>) => Promise<void>;
}> = ({ onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<AIResource['type']>('Prompt');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setLoading(true);
    try {
      await onAdd({
        title,
        type,
        content,
        tags
      });
      onClose();
    } catch (error) {
      console.error('Error creating AI resource:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-black w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-white/20 shadow-2xl p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Agregar Recurso IA</h3>
          <button
            onClick={onClose}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">
                Título <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-white/20 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition-colors"
                placeholder="Ej: Generador de Componentes React"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">
                Tipo <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AIResource['type'])}
                className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-yellow-500 transition-colors appearance-none"
                required
              >
                <option value="Prompt">Prompt</option>
                <option value="Snippet">Snippet</option>
                <option value="ModelConfig">ModelConfig</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">
              Contenido <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition-colors resize-none h-40 font-mono text-sm"
              placeholder="Pega tu prompt, fragmento de código o configuración aquí..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-2">
              Etiquetas
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition-colors"
                placeholder="Ej: React, Ventas, Backend"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Agregar
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-yellow-900/30 text-yellow-300 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-yellow-100"
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
              disabled={loading || !title || !content}
              className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Creando...' : 'Crear Recurso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};