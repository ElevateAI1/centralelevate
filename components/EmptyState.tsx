import React from 'react';
import { 
  Briefcase, 
  CheckSquare, 
  Users, 
  DollarSign, 
  TrendingUp, 
  FileText,
  Plus,
  Inbox
} from 'lucide-react';

export type EmptyStateType = 
  | 'projects' 
  | 'tasks' 
  | 'leads' 
  | 'transactions' 
  | 'graph' 
  | 'subscriptions'
  | 'general';

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const getDefaultConfig = (type: EmptyStateType) => {
  const configs: Record<EmptyStateType, { icon: React.ReactNode; title: string; message: string; actionLabel: string }> = {
    projects: {
      icon: <Briefcase className="w-16 h-16 text-violet-400" />,
      title: 'Sin proyectos activos',
      message: 'Comienza creando tu primer proyecto para organizar tu trabajo y equipo.',
      actionLabel: 'Crear primer proyecto'
    },
    tasks: {
      icon: <CheckSquare className="w-16 h-16 text-blue-400" />,
      title: 'No hay tareas',
      message: 'No se encontraron tareas que coincidan con tus filtros. Crea una nueva tarea para comenzar.',
      actionLabel: 'Nueva tarea'
    },
    leads: {
      icon: <Users className="w-16 h-16 text-emerald-400" />,
      title: 'Pipeline vacío',
      message: 'Aún no tienes leads en tu pipeline. Agrega tu primer lead para comenzar a rastrear oportunidades.',
      actionLabel: 'Agregar primer lead'
    },
    transactions: {
      icon: <DollarSign className="w-16 h-16 text-amber-400" />,
      title: 'Sin transacciones registradas',
      message: 'No hay transacciones financieras registradas. Agrega tu primera transacción para comenzar a rastrear ingresos y gastos.',
      actionLabel: 'Agregar transacción'
    },
    graph: {
      icon: <TrendingUp className="w-16 h-16 text-slate-400" />,
      title: 'Sin datos para mostrar',
      message: 'No hay suficientes datos para generar este gráfico. Los datos aparecerán aquí una vez que tengas información registrada.',
      actionLabel: ''
    },
    subscriptions: {
      icon: <FileText className="w-16 h-16 text-purple-400" />,
      title: 'Sin suscripciones',
      message: 'No hay suscripciones registradas. Agrega tus servicios para rastrear costos recurrentes.',
      actionLabel: 'Agregar suscripción'
    },
    general: {
      icon: <Inbox className="w-16 h-16 text-slate-400" />,
      title: 'Sin contenido',
      message: 'No hay elementos para mostrar en este momento.',
      actionLabel: ''
    }
  };
  return configs[type];
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  message,
  actionLabel,
  onAction,
  icon
}) => {
  const defaultConfig = getDefaultConfig(type);
  
  const finalTitle = title || defaultConfig.title;
  const finalMessage = message || defaultConfig.message;
  const finalActionLabel = actionLabel !== undefined ? actionLabel : defaultConfig.actionLabel;
  const finalIcon = icon || defaultConfig.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-6 flex items-center justify-center">
        {finalIcon}
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        {finalTitle}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6">
        {finalMessage}
      </p>
      {finalActionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg shadow-violet-500/20 transition-all active:scale-95"
        >
          <Plus size={16} />
          {finalActionLabel}
        </button>
      )}
    </div>
  );
};

