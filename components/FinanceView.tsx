import React, { useState } from 'react';
import { useStore } from '../store';
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, Plus, X, Tag } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { TransactionType } from '../types';
import { EmptyState } from './EmptyState';

export const FinanceView: React.FC = () => {
  const { financials, transactions, addTransaction, user } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Only CFO and Founders can access financial data
  if (user && user.role !== 'CFO' && user.role !== 'Founder') {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
        <div className="text-center py-16">
          <h2 className="text-h2 text-slate-900 dark:text-white mb-4">Acceso Restringido</h2>
          <p className="text-body text-slate-600 dark:text-slate-400 mb-6">
            Los datos financieros solo están disponibles para CFO y Founders.
          </p>
          <p className="text-small text-slate-500 dark:text-slate-500">
            Contacta con el CFO o Founder para más información.
          </p>
        </div>
      </div>
    );
  }
  
  const totalRevenue = financials.reduce((acc, r) => acc + r.revenue, 0);
  const totalExpenses = financials.reduce((acc, r) => acc + r.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;
  const margin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  // Sorting transactions to show newest first
  const recentTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const hasTransactions = transactions.length > 0;
  const hasFinancialData = financials.length > 0 && (totalRevenue > 0 || totalExpenses > 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-white mb-1">Rendimiento Financiero</h2>
           <p className="text-slate-400 text-sm">Resumen P&L y Gestión de Flujo de Caja</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-violet-500/20"
          >
            <Plus size={16} /> Agregar Transacción
          </button>
        </div>
      </div>
      
      {/* Key Metrics */}
      {!hasFinancialData && !hasTransactions ? (
        <EmptyState 
          type="transactions" 
          onAction={() => setIsModalOpen(true)}
          title="Sin datos financieros"
          message="No hay transacciones registradas. Agrega tu primera transacción para comenzar a rastrear ingresos y gastos."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 p-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <DollarSign size={24} />
               </div>
               {netProfit !== 0 && (
                 <span className="text-xs font-medium bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full flex items-center gap-1">
                   <ArrowUpRight size={12} /> +12%
                 </span>
               )}
            </div>
            <p className="text-slate-400 text-sm font-medium">Ganancia Neta (Año Actual)</p>
            <h3 className="text-3xl font-bold text-white mt-1">${netProfit.toLocaleString()}</h3>
            {netProfit === 0 && (
              <p className="text-xs text-slate-500 mt-2">Sin transacciones registradas</p>
            )}
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400">
                  <TrendingUp size={24} />
               </div>
            </div>
            <p className="text-slate-400 text-sm font-medium">Margen Bruto</p>
            <h3 className="text-3xl font-bold text-white mt-1">{margin}%</h3>
            {margin === 0 && totalRevenue === 0 && (
              <p className="text-xs text-slate-500 mt-2">Calculado sobre ingresos totales</p>
            )}
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
                  <TrendingDown size={24} />
               </div>
            </div>
            <p className="text-slate-400 text-sm font-medium">Gastos Totales</p>
            <h3 className="text-3xl font-bold text-white mt-1">${totalExpenses.toLocaleString()}</h3>
            {totalExpenses === 0 && (
              <p className="text-xs text-slate-500 mt-2">Año actual</p>
            )}
          </div>
        </div>
      )}

      {hasFinancialData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Trend */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5">
            <h3 className="text-h3 text-white mb-6">Tendencia de Ingresos y Gastos</h3>
            {financials.length === 0 || (!financials.some(f => f.revenue > 0 || f.expenses > 0)) ? (
              <EmptyState type="graph" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financials}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Ingresos" />
                    <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" name="Gastos" />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Profitability Bar Chart */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5">
             <h3 className="text-h3 text-white mb-6">Ganancia Mensual</h3>
             {financials.length === 0 || (!financials.some(f => f.profit !== undefined)) ? (
               <EmptyState type="graph" />
             ) : (
               <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financials}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                    <Bar dataKey="profit" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Ganancia Neta" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
             )}
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
           <h3 className="text-h3 text-white">Transacciones Recientes</h3>
           {hasTransactions && (
             <button className="text-sm text-violet-400 hover:text-violet-300">Ver Todas</button>
           )}
        </div>
        {!hasTransactions ? (
          <EmptyState 
            type="transactions" 
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="p-4 font-medium">Descripción</th>
                  <th className="p-4 font-medium">Categoría</th>
                  <th className="p-4 font-medium">Fecha</th>
                  <th className="p-4 font-medium">Estado</th>
                  <th className="p-4 font-medium text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-white/5">
                {recentTransactions.slice(0, 10).map(tx => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-medium text-white">
                      {tx.description}
                    </td>
                    <td className="p-4 text-slate-400">
                      <span className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs flex w-fit items-center gap-1">
                        <Tag size={10} /> {tx.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{tx.date}</td>
                    <td className="p-4">
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">
                        Completada
                      </span>
                    </td>
                    <td className={`p-4 font-bold text-right ${tx.type === 'Income' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.type === 'Income' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <TransactionModal onClose={() => setIsModalOpen(false)} onAdd={addTransaction} />
      )}
    </div>
  );
};

const TransactionModal: React.FC<{ onClose: () => void; onAdd: (t: any) => void }> = ({ onClose, onAdd }) => {
  const [type, setType] = useState<TransactionType>('Income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && description) {
      onAdd({
        type,
        amount: parseFloat(amount),
        description,
        category: category || 'General',
        date
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e293b] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Agregar Transacción</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Toggle Type */}
          <div className="grid grid-cols-2 gap-2 bg-slate-900/50 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setType('Income')}
              className={`py-2 text-sm font-medium rounded-md transition-all ${
                type === 'Income' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ingreso
            </button>
            <button
              type="button"
              onClick={() => setType('Expense')}
              className={`py-2 text-sm font-medium rounded-md transition-all ${
                type === 'Expense' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              Gasto
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Monto ($)</label>
            <input 
              type="number" 
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Descripción</label>
            <input 
              type="text" 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="Ej: Pago Cliente - Proyecto X"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Categoría</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 transition-colors appearance-none"
              >
                <option value="">Seleccionar...</option>
                {type === 'Income' ? (
                  <>
                    <option value="Project">Pago de Proyecto</option>
                    <option value="Retainer">Retención</option>
                    <option value="Consulting">Consultoría</option>
                    <option value="Other">Otro</option>
                  </>
                ) : (
                  <>
                    <option value="Infrastructure">Infraestructura</option>
                    <option value="Software">Software</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Payroll">Nómina</option>
                    <option value="Operations">Operaciones</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Fecha</label>
              <input 
                type="date" 
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 transition-colors"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-violet-600/20 transition-all mt-4"
          >
            Agregar Transacción
          </button>
        </form>
      </div>
    </div>
  );
};