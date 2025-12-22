import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { LeadStage } from '../types';
import { DollarSign, MoreHorizontal, Plus, X } from 'lucide-react';
import { EmptyState } from './EmptyState';

const STAGES: LeadStage[] = ['New', 'Contacted', 'Proposal', 'Negotiation', 'Won'];

const STAGE_COLORS: Record<LeadStage, { bg: string; text: string; border: string }> = {
  New: {
    bg: 'bg-blue-500/20 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-500/30 dark:border-blue-500/30'
  },
  Contacted: {
    bg: 'bg-yellow-500/20 dark:bg-yellow-500/20',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-500/30 dark:border-yellow-500/30'
  },
  Proposal: {
    bg: 'bg-orange-500/20 dark:bg-orange-500/20',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-500/30 dark:border-orange-500/30'
  },
  Negotiation: {
    bg: 'bg-purple-500/20 dark:bg-purple-500/20',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-500/30 dark:border-purple-500/30'
  },
  Won: {
    bg: 'bg-emerald-500/20 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-500/30 dark:border-emerald-500/30'
  },
  Lost: {
    bg: 'bg-red-500/20 dark:bg-red-500/20',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-500/30 dark:border-red-500/30'
  }
};

export const LeadsPipeline: React.FC = () => {
  const { leads, updateLeadStage, addLead, user } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('leadId', id);
  };

  const handleDrop = (e: React.DragEvent, stage: LeadStage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('leadId');
    if (id) {
      updateLeadStage(id, stage);
    }
  };

  const canAddLead = user?.role === 'Founder' || user?.role === 'CTO' || user?.role === 'Sales';
  
  const totalPipelineValue = useMemo(() => {
    return leads.reduce((sum, l) => sum + l.value, 0);
  }, [leads]);
  
  const hasLeads = leads.length > 0;
  const leadsByStage = useMemo(() => {
    const grouped: Record<LeadStage, number> = {
      New: 0,
      Contacted: 0,
      Proposal: 0,
      Negotiation: 0,
      Won: 0,
      Lost: 0
    };
    leads.forEach(lead => {
      grouped[lead.stage] = (grouped[lead.stage] || 0) + 1;
    });
    return grouped;
  }, [leads]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-h2 text-slate-900 dark:text-white">Pipeline de Ventas</h2>
        <div className="flex items-center gap-4">
          {hasLeads && (
            <div className="bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20">
              <span className="text-emerald-400 text-sm font-semibold">Valor Total del Pipeline: </span>
              <span className="text-emerald-600 dark:text-emerald-300 font-bold ml-1">
                ${totalPipelineValue.toLocaleString()}
              </span>
            </div>
          )}
          {canAddLead && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-violet-500/20 transition-all"
            >
              <Plus size={16} /> Agregar Lead
            </button>
          )}
        </div>
      </div>

      {!hasLeads ? (
        <div className="flex-1">
          <EmptyState 
            type="leads" 
            onAction={canAddLead ? () => setIsModalOpen(true) : undefined}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-[1200px] h-full">
            {STAGES.map(stage => {
              const stageLeads = leads.filter(l => l.stage === stage);
              const stageColor = STAGE_COLORS[stage];
              const isEmpty = stageLeads.length === 0;
              
              return (
                <div 
                  key={stage}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, stage)}
                  className={`flex-1 bg-slate-100 dark:bg-black/30 rounded-xl border border-slate-300 dark:border-white/10 flex flex-col ${isEmpty ? 'min-w-[200px]' : ''}`}
                >
                  <div className={`p-3 border-b border-slate-200 dark:border-white/5 flex justify-between items-center ${stageColor.bg}`}>
                    <span className={`font-medium ${stageColor.text}`}>{stage}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${stageColor.bg} ${stageColor.text} border ${stageColor.border}`}>
                      {stageLeads.length}
                    </span>
                  </div>
                  <div className="p-2 space-y-2 flex-1 overflow-y-auto min-h-[200px]">
                    {isEmpty ? (
                      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                        Arrastra leads aquí
                      </div>
                    ) : (
                      stageLeads.map(lead => (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          className="bg-white dark:bg-black p-3 rounded-lg border border-slate-200 dark:border-white/10 cursor-grab hover:border-violet-500/50 transition-all shadow-lg active:cursor-grabbing"
                        >
                          <div className="flex justify-between mb-2">
                            <span className="font-semibold text-slate-900 dark:text-slate-200 text-sm">{lead.companyName}</span>
                            <MoreHorizontal size={14} className="text-slate-600" />
                          </div>
                          <p className="text-xs text-slate-500 mb-3">{lead.contactPerson}</p>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center text-emerald-400 text-xs font-medium bg-emerald-900/20 px-2 py-0.5 rounded">
                              <DollarSign size={10} />
                              {lead.value.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-600">
                              {lead.probability}% Prob.
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isModalOpen && (
        <LeadModal onClose={() => setIsModalOpen(false)} onAdd={addLead} />
      )}
    </div>
  );
};

const LeadModal: React.FC<{ onClose: () => void; onAdd: (lead: Partial<any>) => Promise<void> }> = ({ onClose, onAdd }) => {
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [value, setValue] = useState('');
  const [probability, setProbability] = useState('0');
  const [stage, setStage] = useState<LeadStage>('New');
  const [loading, setLoading] = useState(false);

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
      <div className="bg-white dark:bg-black w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/20 shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Agregar Nuevo Lead</h3>
          <button
            onClick={onClose}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">
              Nombre de la Empresa <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-white/20 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Acme Corp"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">
              Persona de Contacto <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="w-full bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-white/20 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Juan Pérez"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">
                Valor ($) <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-white/20 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="50000"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">
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
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">
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