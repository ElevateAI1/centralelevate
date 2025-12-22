import React, { useState } from 'react';
import { useStore } from '../store';
import { AlertTriangle, CreditCard, Plus, X } from 'lucide-react';
import { Subscription } from '../types';

export const SubscriptionsView: React.FC = () => {
  const { subscriptions, addSubscription } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Suscripciones Activas</h2>
        <div className="flex gap-3">
            <button className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-white px-4 py-2 rounded-lg text-sm border border-slate-300 dark:border-white/5 transition-colors">
            Exportar Reporte
            </button>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-violet-500/20"
            >
                <Plus size={16} /> Agregar Suscripción
            </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm transition-colors duration-200 relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs uppercase">
              <tr>
                <th className="p-4 font-medium">Servicio</th>
                <th className="p-4 font-medium">Categoría</th>
                <th className="p-4 font-medium">Costo</th>
                <th className="p-4 font-medium">Renovación</th>
                <th className="p-4 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-white/5">
              {subscriptions.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-slate-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-300">
                       {sub.service.charAt(0)}
                    </div>
                    {sub.service}
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">
                    <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                      {sub.category}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-200">${sub.cost}/{sub.cycle === 'Monthly' ? 'mo' : 'yr'}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{sub.renewalDate}</td>
                  <td className="p-4">
                    <span className="text-emerald-600 dark:text-emerald-400 text-xs bg-emerald-100 dark:bg-emerald-500/10 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-500/20">
                      Activo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-gradient-to-br from-violet-50 to-slate-50 dark:from-violet-900/20 dark:to-slate-900/50 shadow-sm transition-colors duration-200">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-violet-100 dark:bg-violet-500/20 rounded-lg text-violet-600 dark:text-violet-300">
                  <CreditCard size={20} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Consumo Mensual</h3>
             </div>
             <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
               ${subscriptions.reduce((acc, s) => acc + (s.cycle === 'Monthly' ? s.cost : s.cost/12), 0).toFixed(0).toLocaleString()}
             </p>
             <p className="text-slate-500 dark:text-slate-400 text-sm">Costos recurrentes mensuales estimados</p>
           </div>

           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-l-4 border-amber-500 shadow-sm border-t border-r border-b border-slate-200 dark:border-white/5 transition-colors duration-200">
              <h4 className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold mb-2">
                <AlertTriangle size={18} /> Renovaciones Próximas
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">3 servicios se renuevan en los próximos 7 días.</p>
              <div className="space-y-3">
                {subscriptions.slice(0, 3).map(s => (
                  <div key={s.id} className="flex justify-between text-sm">
                    <span className="text-slate-700 dark:text-slate-300">{s.service}</span>
                    <span className="text-slate-500 dark:text-slate-500">{s.renewalDate}</span>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>

      {isModalOpen && (
        <SubscriptionModal onClose={() => setIsModalOpen(false)} onAdd={addSubscription} />
      )}
    </div>
  );
};

const SubscriptionModal: React.FC<{ onClose: () => void; onAdd: (sub: any) => void }> = ({ onClose, onAdd }) => {
  const [service, setService] = useState('');
  const [category, setCategory] = useState<Subscription['category']>('Infrastructure');
  const [cost, setCost] = useState('');
  const [cycle, setCycle] = useState<Subscription['cycle']>('Monthly');
  const [renewalDate, setRenewalDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (service && cost) {
      onAdd({
        service,
        category,
        cost: parseFloat(cost),
        cycle,
        renewalDate
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1e293b] w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Agregar Suscripción</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 p-1 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Nombre del Servicio</label>
            <input 
              type="text" 
              value={service}
              onChange={e => setService(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="Ej: OpenAI, AWS"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Costo</label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                    <input 
                    type="number" 
                    value={cost}
                    onChange={e => setCost(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg pl-7 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 transition-colors"
                    placeholder="0.00"
                    required
                    />
                </div>
             </div>
             <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Ciclo de Facturación</label>
                <select 
                    value={cycle}
                    onChange={e => setCycle(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 transition-colors appearance-none"
                >
                    <option value="Monthly">Mensual</option>
                    <option value="Yearly">Anual</option>
                </select>
             </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Categoría</label>
            <select 
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 transition-colors appearance-none"
            >
              <option value="Infrastructure">Infraestructura</option>
              <option value="Design">Diseño</option>
              <option value="AI">IA</option>
              <option value="Management">Gestión</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Próxima Renovación</label>
            <input 
              type="date" 
              value={renewalDate}
              onChange={e => setRenewalDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 transition-colors"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-violet-600/20 transition-all mt-4"
          >
            Agregar Suscripción
          </button>
        </form>
      </div>
    </div>
  );
};