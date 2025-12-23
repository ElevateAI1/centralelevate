import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { Project, Task, Lead, User, Subscription, Role, ProjectStatus, LeadStage, FinancialRecord, AIResource, Post, Transaction, Theme, Product, TechStack } from './types';
import { supabase } from './lib/supabase';
import { auth } from './lib/auth';

// Helper function to format relative time
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  return date.toLocaleDateString();
};

// Helper para mostrar notificaciones del navegador
const showNotification = (title: string, options?: NotificationOptions) => {
  if (!('Notification' in window)) return;
  
  const desktopNotifs = localStorage.getItem('pref_desktopNotifs');
  if (desktopNotifs === 'true' && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });
  }
};

// --- STORE CONTEXT ---

interface AppState {
  // Auth
  user: User | null;
  setUser: (user: User) => void;
  originalUserRole: Role | null; // Rol original del usuario (no cambia con View As)
  loading: boolean;
  signOut: () => void;
  loadUser: () => Promise<void>;
  // Data
  users: User[];
  projects: Project[];
  products: Product[]; // Products for Central Elevate
  tasks: Task[];
  leads: Lead[];
  subscriptions: Subscription[];
  financials: FinancialRecord[];
  transactions: Transaction[];
  aiResources: AIResource[];
  posts: Post[];
  theme: Theme;
  setTheme: (theme: Theme) => void;
  setUserRole: (role: Role) => void;
  // Project functions
  updateProjectStatus: (id: string, status: ProjectStatus) => Promise<void>;
  updateProjectDetails: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  createProject: (project: Partial<Project>) => Promise<void>;
  // Lead functions
  updateLeadStage: (id: string, stage: LeadStage) => Promise<void>;
  addLead: (lead: Partial<Lead>) => Promise<void>;
  // Task functions
  toggleTaskStatus: (id: string) => Promise<void>;
  addTask: (task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  // Post functions
  addPost: (content: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  updatePost: (postId: string, content: string) => Promise<void>;
  // Transaction functions
  addTransaction: (transaction: Partial<Transaction>) => Promise<void>;
  // Subscription functions
  addSubscription: (subscription: Partial<Subscription>) => Promise<void>;
  // AI Resource functions
  addAIResource: (resource: Partial<AIResource>) => Promise<void>;
  // Comment functions
  addComment: (postId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  // Auth functions
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  // Product functions (Central Elevate)
  createProduct: (product: Partial<Product>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  uploadProductImage: (file: File, productId?: string) => Promise<string>;
  fetchVercelDeploymentStatus: (vercelProjectId: string, teamId?: string) => Promise<{ status: string; lastDeployment: string | null } | null>;
  // Load functions
  loadAllData: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [originalUserRole, setOriginalUserRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Data state
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [aiResources, setAiResources] = useState<AIResource[]>([]);
  
  // Initialize theme from localStorage or default to 'dark'
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexus-theme');
      return (saved as Theme) || 'dark';
    }
    return 'dark';
  });

  // Apply theme on mount
  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = (t: Theme) => {
      let activeTheme = t;
      
      if (t === 'system') {
        activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      root.classList.remove('light', 'dark');
      if (activeTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }
    };
    
    applyTheme(theme);
    localStorage.setItem('nexus-theme', theme);
    
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Load user from custom auth
  const loadUser = async () => {
    try {
      const currentUser = auth.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setOriginalUserRole(currentUser.role); // Guardar el rol original
      } else {
        setUser(null);
        setOriginalUserRole(null);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
      setOriginalUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  // Load all users
  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');

      if (error) throw error;
      
      setUsers((data || []).map(u => ({
        id: u.id,
        name: u.name,
        avatar: u.avatar || `https://picsum.photos/seed/${u.id}/200`,
        role: u.role
      })));
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Load projects with relations
  const loadProjects = async () => {
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Load team members for each project
      const projectsWithRelations = await Promise.all(
        (projectsData || []).map(async (p) => {
          // Get team members
          const { data: teamData } = await supabase
            .from('project_team')
            .select('user_id')
            .eq('project_id', p.id);

          // Get tech stack
          const { data: techData } = await supabase
            .from('project_tech_stack')
            .select('tech')
            .eq('project_id', p.id);

          // Parse features if it's a JSON string, otherwise treat as comma-separated
          let features: string[] = [];
          if (p.features) {
            try {
              features = JSON.parse(p.features);
            } catch {
              // If not JSON, treat as comma-separated string
              features = p.features.split(',').map((f: string) => f.trim()).filter((f: string) => f.length > 0);
            }
          }

          return {
            id: p.id,
            name: p.name,
            clientName: p.client_name,
            clientLogo: p.client_logo || `https://picsum.photos/seed/${p.client_name}/50`,
            status: p.status as ProjectStatus,
            progress: p.progress,
            dueDate: p.due_date,
            budget: Number(p.budget),
            team: (teamData || []).map(t => t.user_id),
            tech: (techData || []).map((t: any) => t.tech) as TechStack[],
            description: p.description || '',
            lastUpdate: p.last_update || formatRelativeTime(new Date(p.updated_at)),
            managerNotes: p.manager_notes || undefined,
            url: p.project_url || undefined, // Legacy field
            isStarred: p.is_starred || false,
            // Central Elevate fields
            gitRepoUrl: p.git_repo_url || undefined,
            vercelUrl: p.vercel_url || undefined,
            productUrl: p.product_url || p.project_url || undefined, // Fallback to project_url for backward compatibility
            currentStatus: p.current_status || undefined,
            features: features.length > 0 ? features : undefined
          } as Project;
        })
      );

      setProjects(projectsWithRelations);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  // Load tasks
  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTasks((data || []).map(t => ({
        id: t.id,
        title: t.title,
        projectId: t.project_id,
        assigneeId: t.assignee_id,
        status: t.status as Task['status'],
        priority: t.priority as Task['priority'],
        dueDate: t.due_date
      })));
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  // Load leads
  const loadLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLeads((data || []).map(l => ({
        id: l.id,
        companyName: l.company_name,
        contactPerson: l.contact_person,
        value: Number(l.value),
        stage: l.stage as LeadStage,
        probability: l.probability,
        lastContact: l.last_contact || formatRelativeTime(new Date(l.updated_at))
      })));
    } catch (error) {
      console.error('Error loading leads:', error);
    }
  };

  // Load transactions
  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      setTransactions((data || []).map(t => ({
        id: t.id,
        date: t.date,
        description: t.description,
        amount: Number(t.amount),
        type: t.type as Transaction['type'],
        category: t.category,
        status: t.status as Transaction['status']
      })));
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  // Load subscriptions
  const loadSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('renewal_date', { ascending: true });

      if (error) throw error;

      setSubscriptions((data || []).map(s => ({
        id: s.id,
        service: s.service,
        cost: Number(s.cost),
        cycle: s.cycle as Subscription['cycle'],
        renewalDate: s.renewal_date,
        category: s.category as Subscription['category']
      })));
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  // Load AI resources with tags
  const loadAIResources = async () => {
    try {
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('ai_resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (resourcesError) throw resourcesError;

      const resourcesWithTags = await Promise.all(
        (resourcesData || []).map(async (r) => {
          const { data: tagsData } = await supabase
            .from('ai_resource_tags')
            .select('tag')
            .eq('resource_id', r.id);

          return {
            id: r.id,
            title: r.title,
            type: r.type as AIResource['type'],
            content: r.content,
            tags: (tagsData || []).map(t => t.tag),
            authorId: r.author_id,
            likes: r.likes
          } as AIResource;
        })
      );

      setAiResources(resourcesWithTags);
    } catch (error) {
      console.error('Error loading AI resources:', error);
    }
  };

  // Load posts with comments
  const loadPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      const postsWithComments = await Promise.all(
        (postsData || []).map(async (p) => {
          const { data: commentsData } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', p.id)
            .order('created_at', { ascending: true });

          return {
            id: p.id,
            authorId: p.author_id,
            content: p.content,
            timestamp: p.timestamp || formatRelativeTime(new Date(p.created_at)),
            likes: p.likes,
            comments: (commentsData || []).map(c => ({
              id: c.id,
              authorId: c.author_id,
              content: c.content,
              timestamp: c.timestamp || formatRelativeTime(new Date(c.created_at))
            })),
            category: p.category as Post['category']
          } as Post;
        })
      );

      setPosts(postsWithComments);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  // Load products for Central Elevate
  const loadProducts = async () => {
    try {
      console.log('🔄 Iniciando carga de productos...');
      const { data: productsData, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log(`📦 Productos encontrados: ${productsData?.length || 0}`);
      if (productsData && productsData.length > 0) {
        productsData.forEach(p => {
          console.log(`  - ${p.name}: vercel_project_id=${p.vercel_project_id || 'N/A'}, vercel_team_id=${(p as any).vercel_team_id || 'N/A'}`);
        });
      }

      const productsWithVercelStatus = await Promise.all(
        (productsData || []).map(async (p) => {
          // Parse features
          let features: string[] = [];
          if (p.features) {
            try {
              features = JSON.parse(p.features);
            } catch {
              features = p.features.split(',').map((f: string) => f.trim()).filter((f: string) => f.length > 0);
            }
          }

          // Fetch Vercel deployment status if vercel_project_id exists
          let vercelStatus: { status: string; lastDeployment: string | null } | null = null;
          if (p.vercel_project_id) {
            console.log(`✅ Producto ${p.name} tiene vercel_project_id: ${p.vercel_project_id}`);
            try {
              // Pass teamId if available (for team projects)
              const teamId = (p as any).vercel_team_id || undefined;
              console.log(`🔍 Obteniendo estado de Vercel para producto ${p.name}:`, { projectId: p.vercel_project_id, teamId });
              vercelStatus = await fetchVercelDeploymentStatus(p.vercel_project_id, teamId);
              console.log(`📊 Estado obtenido para ${p.name}:`, vercelStatus);
            } catch (error) {
              console.error(`❌ Error fetching Vercel status para ${p.name}:`, error);
            }
          } else {
            console.log(`⚠️ Producto ${p.name} NO tiene vercel_project_id`);
          }

          const product = {
            id: p.id,
            name: p.name,
            description: p.description || '',
            imageUrl: p.image_url || undefined,
            currentStatus: p.current_status || undefined,
            gitRepoUrl: p.git_repo_url || undefined,
            vercelUrl: p.vercel_url || undefined,
            vercelProjectId: p.vercel_project_id || undefined,
            vercelTeamId: (p as any).vercel_team_id || undefined,
            productUrl: p.product_url || undefined,
            features: features.length > 0 ? features : undefined,
            isStarred: p.is_starred || false,
            vercelDeploymentStatus: vercelStatus?.status ? (vercelStatus.status as 'READY' | 'ERROR' | 'BUILDING' | 'QUEUED' | 'CANCELED') : null,
            vercelLastDeployment: vercelStatus?.lastDeployment || undefined,
            createdAt: p.created_at,
            updatedAt: p.updated_at
          } as Product;
          
          console.log(`📦 Producto procesado ${product.name}:`, {
            vercelProjectId: product.vercelProjectId,
            vercelTeamId: product.vercelTeamId,
            vercelDeploymentStatus: product.vercelDeploymentStatus,
            vercelLastDeployment: product.vercelLastDeployment
          });
          
          return product;
        })
      );

      console.log(`✅ Productos cargados: ${productsWithVercelStatus.length}`);
      productsWithVercelStatus.forEach(product => {
        console.log(`  - ${product.name}: vercelDeploymentStatus=${product.vercelDeploymentStatus || 'null'}, vercelLastDeployment=${product.vercelLastDeployment || 'null'}`);
      });
      setProducts(productsWithVercelStatus);
    } catch (error) {
      console.error('❌ Error loading products:', error);
    }
  };

  // Fetch Vercel deployment status
  const fetchVercelDeploymentStatus = async (vercelProjectId: string, teamId?: string): Promise<{ status: string; lastDeployment: string | null } | null> => {
    const vercelToken = import.meta.env.VITE_VERCEL_TOKEN;
    
    if (!vercelToken) {
      console.warn('⚠️ Vercel token no configurado. Para habilitar la integración:');
      console.warn('1. En desarrollo local: Agrega VITE_VERCEL_TOKEN a tu archivo .env.local');
      console.warn('2. En producción (Vercel): Agrega VITE_VERCEL_TOKEN en Settings > Environment Variables');
      console.warn('3. El token debe tener el prefijo VITE_ para que Vite lo exponga al cliente');
      return null;
    }

    if (!vercelProjectId || vercelProjectId.trim() === '') {
      console.warn('⚠️ Vercel Project ID no proporcionado');
      return null;
    }

    try {
      // Build URL with optional teamId parameter
      const teamParam = teamId ? `?teamId=${teamId}` : '';
      console.log(`🔍 Consultando estado de Vercel para proyecto: ${vercelProjectId}${teamId ? ` (Team: ${teamId})` : ''}`);
      
      // First, try to get project info to verify the project ID
      const projectUrl = `https://api.vercel.com/v9/projects/${vercelProjectId}${teamParam}`;
      const projectResponse = await fetch(projectUrl, {
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!projectResponse.ok) {
        const errorText = await projectResponse.text();
        if (projectResponse.status === 404) {
          console.warn(`❌ Proyecto Vercel ${vercelProjectId} no encontrado. Verifica que el Project ID sea correcto.`);
          if (!teamId) {
            console.warn('💡 Si el proyecto está en un equipo, necesitas proporcionar el Team ID. Encuéntralo en Settings > General del equipo en Vercel.');
          }
          return null;
        }
        if (projectResponse.status === 403) {
          console.error('❌ ERROR 403: El token de Vercel no tiene acceso a este proyecto.');
          console.error('💡 Soluciones posibles:');
          console.error('   1. Si el proyecto está en un equipo, agrega el Team ID en la configuración del producto');
          console.error('   2. Verifica que el token tenga el scope correcto para el equipo');
          console.error('   3. El token personal puede usarse con equipos agregando ?teamId=<team-id> a las URLs');
          console.error('   4. Ve a Vercel > Settings > Tokens y verifica el scope del token');
          if (!teamId) {
            console.error('   5. ⚠️ IMPORTANTE: Este proyecto parece estar en un equipo. Necesitas agregar el Team ID.');
            console.error('      Encuentra el Team ID en: Settings del Equipo > General');
          }
          console.error(`   6. Project ID: ${vercelProjectId}`);
          return null;
        }
        if (projectResponse.status === 401) {
          console.warn('❌ Token de Vercel inválido o expirado. Verifica que el token sea correcto.');
          return null;
        }
        console.error(`❌ Error de API de Vercel (${projectResponse.status}):`, errorText);
        throw new Error(`Vercel API error: ${projectResponse.status}`);
      }

      // Get latest deployment for the project
      const deploymentsUrl = `https://api.vercel.com/v9/projects/${vercelProjectId}/deployments?limit=1${teamId ? `&teamId=${teamId}` : ''}`;
      const response = await fetch(deploymentsUrl, {
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 404) {
          console.warn(`⚠️ No se encontraron deployments para el proyecto ${vercelProjectId}`);
          return null;
        }
        console.error(`❌ Error al obtener deployments (${response.status}):`, errorText);
        throw new Error(`Vercel API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Datos de deployments recibidos:', data);
      
      if (data.deployments && data.deployments.length > 0) {
        const latestDeployment = data.deployments[0];
        console.log(`✅ Estado de Vercel obtenido: ${latestDeployment.readyState}`, latestDeployment);
        
        // Normalizar el estado a mayúsculas para que coincida con los tipos esperados
        const normalizedStatus = (latestDeployment.readyState || 'UNKNOWN').toUpperCase();
        const validStatuses = ['READY', 'ERROR', 'BUILDING', 'QUEUED', 'CANCELED'];
        const status = validStatuses.includes(normalizedStatus) ? normalizedStatus : 'UNKNOWN';
        
        const result = {
          status: status,
          lastDeployment: latestDeployment.createdAt || null
        };
        console.log('📤 Retornando estado normalizado:', result);
        return result;
      }

      console.warn(`⚠️ No hay deployments disponibles para el proyecto ${vercelProjectId}`);
      return null;
    } catch (error: any) {
      console.error('❌ Error al obtener estado de Vercel:', error);
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        console.error('💡 Esto puede ser un problema de CORS o de red. Verifica tu conexión.');
      }
      // Return null instead of throwing to prevent breaking the UI
      return null;
    }
  };

  // Create product
  const createProduct = async (product: Partial<Product>) => {
    if (!user) return;

    try {
      const featuresJson = product.features ? JSON.stringify(product.features) : null;

      const { error } = await supabase
        .from('products')
        .insert({
          name: product.name || 'Nuevo Producto',
          description: product.description || '',
          image_url: product.imageUrl || null,
          current_status: product.currentStatus || null,
          git_repo_url: product.gitRepoUrl || null,
          vercel_url: product.vercelUrl || null,
          vercel_project_id: product.vercelProjectId || null,
          vercel_team_id: product.vercelTeamId || null,
          product_url: product.productUrl || null,
          features: featuresJson,
          is_starred: product.isStarred || false,
          created_by: user.id
        });

      if (error) throw error;
      await loadProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  };

  // Update product
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!user) return;

    try {
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl || null;
      if (updates.currentStatus !== undefined) updateData.current_status = updates.currentStatus || null;
      if (updates.gitRepoUrl !== undefined) updateData.git_repo_url = updates.gitRepoUrl || null;
      if (updates.vercelUrl !== undefined) updateData.vercel_url = updates.vercelUrl || null;
      if (updates.vercelProjectId !== undefined) updateData.vercel_project_id = updates.vercelProjectId || null;
      if (updates.vercelTeamId !== undefined) updateData.vercel_team_id = updates.vercelTeamId || null;
      if (updates.productUrl !== undefined) updateData.product_url = updates.productUrl || null;
      if (updates.features !== undefined) updateData.features = updates.features ? JSON.stringify(updates.features) : null;
      if (updates.isStarred !== undefined) updateData.is_starred = updates.isStarred;

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      await loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  // Upload product image to Supabase Storage
  const uploadProductImage = async (file: File, productId?: string): Promise<string> => {
    if (!user) throw new Error('No hay usuario autenticado');

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('El archivo es demasiado grande. Máximo 5MB');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = productId 
        ? `${productId}-${Date.now()}.${fileExt}`
        : `temp-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Error al obtener la URL pública de la imagen');
      }

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Delete product
  const deleteProduct = async (id: string) => {
    if (!user) return;

    try {
      // Get product to delete image from storage
      const { data: productData } = await supabase
        .from('products')
        .select('image_url')
        .eq('id', id)
        .single();

      // Delete image from storage if exists
      if (productData?.image_url) {
        try {
          // Extract path from URL (e.g., "products/filename.jpg")
          const urlParts = productData.image_url.split('/');
          const pathIndex = urlParts.findIndex((part: string) => part === 'product-images');
          if (pathIndex !== -1 && pathIndex < urlParts.length - 1) {
            const filePath = urlParts.slice(pathIndex + 1).join('/');
            await supabase.storage
              .from('product-images')
              .remove([filePath]);
          }
        } catch (storageError) {
          console.warn('Error deleting image from storage:', storageError);
          // Continue with product deletion even if image deletion fails
        }
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  // Load all data
  const loadAllData = async () => {
    if (!user) {
      console.log('⚠️ No hay usuario, no se cargan los datos');
      return;
    }
    
    console.log('🚀 Iniciando carga de todos los datos...');
    await Promise.all([
      loadUsers(),
      loadProjects(),
      loadProducts(),
      loadTasks(),
      loadLeads(),
      loadTransactions(),
      loadSubscriptions(),
      loadAIResources(),
      loadPosts()
    ]);
  };

  // Sign out
  const signOut = () => {
    auth.logout();
    setUser(null);
    setProjects([]);
    setTasks([]);
    setLeads([]);
      setPosts([]);
      setProducts([]);
      setTransactions([]);
      setSubscriptions([]);
      setAiResources([]);
      setUsers([]);
  };

  // Initialize auth on mount
  useEffect(() => {
    loadUser();
  }, []);

  // Load data when user is loaded
  useEffect(() => {
    if (user && !loading) {
      loadAllData();
    }
  }, [user, loading]);


  // Dynamically calculate monthly financials from transactions
  const financials = useMemo(() => {
    const monthlyData: Record<string, FinancialRecord> = {};
    
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sorted.forEach(t => {
      const date = new Date(t.date);
      const month = date.toLocaleString('default', { month: 'short' });
      
      if (!monthlyData[month]) {
        monthlyData[month] = { month, revenue: 0, expenses: 0, profit: 0 };
      }

      if (t.type === 'Income') {
        monthlyData[month].revenue += t.amount;
      } else {
        monthlyData[month].expenses += t.amount;
      }
      monthlyData[month].profit = monthlyData[month].revenue - monthlyData[month].expenses;
    });

    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return Object.values(monthlyData).sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
  }, [transactions]);

  // Project functions
  const updateProjectStatus = async (id: string, status: ProjectStatus) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status, last_update: formatRelativeTime(new Date()) })
        .eq('id', id);

      if (error) throw error;
      await loadProjects();
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  const updateProjectDetails = async (id: string, updates: Partial<Project>) => {
    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.clientName !== undefined) dbUpdates.client_name = updates.clientName;
      if (updates.clientLogo !== undefined) dbUpdates.client_logo = updates.clientLogo;
      if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
      if (updates.managerNotes !== undefined) dbUpdates.manager_notes = updates.managerNotes;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
      if (updates.budget !== undefined) dbUpdates.budget = updates.budget;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.url !== undefined) dbUpdates.project_url = updates.url;
      if (updates.productUrl !== undefined) dbUpdates.product_url = updates.productUrl;
      if (updates.gitRepoUrl !== undefined) dbUpdates.git_repo_url = updates.gitRepoUrl;
      if (updates.vercelUrl !== undefined) dbUpdates.vercel_url = updates.vercelUrl;
      if (updates.isStarred !== undefined) dbUpdates.is_starred = updates.isStarred;
      dbUpdates.last_update = formatRelativeTime(new Date());

      const { error } = await supabase
        .from('projects')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      // Update team members if provided
      if (updates.team !== undefined) {
        // Delete existing team members
        await supabase
          .from('project_team')
          .delete()
          .eq('project_id', id);

        // Add new team members
        if (updates.team.length > 0) {
          await supabase
            .from('project_team')
            .insert(updates.team.map(userId => ({
              project_id: id,
              user_id: userId
            })));
        }
      }

      // Update tech stack if provided
      if (updates.tech !== undefined) {
        // Delete existing tech stack
        await supabase
          .from('project_tech_stack')
          .delete()
          .eq('project_id', id);

        // Add new tech stack
        if (updates.tech.length > 0) {
          await supabase
            .from('project_tech_stack')
            .insert(updates.tech.map(tech => ({
              project_id: id,
              tech
            })));
        }
      }

      const previousProject = projects.find(p => p.id === id);
      const newProgress = updates.progress !== undefined ? updates.progress : previousProject?.progress || 0;
      const wasCompleted = previousProject?.progress === 100;
      const isNowCompleted = newProgress === 100 && !wasCompleted;

      // Store celebration info before loading projects
      const shouldCelebrate = isNowCompleted && previousProject && user && previousProject.team.includes(user.id);
      const celebrationKey = shouldCelebrate ? `project_celebration_${id}_${user.id}` : null;
      const hasCelebrated = celebrationKey ? localStorage.getItem(celebrationKey) : true;

      await loadProjects();

      // Show celebration modal if project just reached 100% and hasn't been celebrated yet
      if (shouldCelebrate && !hasCelebrated) {
        // Get updated project after loadProjects
        const { data: updatedProjectData } = await supabase
          .from('projects')
          .select(`
            *,
            project_team(user_id),
            project_tech_stack(tech)
          `)
          .eq('id', id)
          .single();

        if (updatedProjectData) {
          const teamData = updatedProjectData.project_team || [];
          const techData = updatedProjectData.project_tech_stack || [];
          
          const updatedProject: Project = {
            id: updatedProjectData.id,
            name: updatedProjectData.name,
            clientName: updatedProjectData.client_name,
            clientLogo: updatedProjectData.client_logo,
            status: updatedProjectData.status as ProjectStatus,
            progress: updatedProjectData.progress,
            dueDate: updatedProjectData.due_date,
            budget: Number(updatedProjectData.budget),
            team: teamData.map((t: any) => t.user_id),
            tech: techData.map((t: any) => t.tech) as TechStack[],
            description: updatedProjectData.description || '',
            lastUpdate: updatedProjectData.last_update || formatRelativeTime(new Date(updatedProjectData.updated_at)),
            managerNotes: updatedProjectData.manager_notes || undefined,
            url: updatedProjectData.project_url || undefined,
            isStarred: updatedProjectData.is_starred || false,
            gitRepoUrl: updatedProjectData.git_repo_url || undefined,
            vercelUrl: updatedProjectData.vercel_url || undefined,
            productUrl: updatedProjectData.product_url || undefined
          };

          localStorage.setItem(celebrationKey!, 'true');
          // Dispatch event for celebration modal
          window.dispatchEvent(new CustomEvent('project-completed', { 
            detail: { project: updatedProject, userId: user.id } 
          }));
        }
      }
    } catch (error) {
      console.error('Error updating project details:', error);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const createProject = async (project: Partial<Project>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: project.name || 'New Project',
          client_name: project.clientName || 'Client',
          client_logo: project.clientLogo || `https://picsum.photos/seed/${project.clientName || 'client'}/50`,
          status: project.status || 'Proposal',
          progress: project.progress || 0,
          due_date: project.dueDate || new Date().toISOString().split('T')[0],
          budget: project.budget || 0,
          description: project.description || '',
          manager_notes: project.managerNotes || null,
          last_update: formatRelativeTime(new Date()),
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add team members
      if (project.team && project.team.length > 0) {
        await supabase
          .from('project_team')
          .insert(project.team.map(userId => ({
            project_id: data.id,
            user_id: userId
          })));
      }

      // Add tech stack
      if (project.tech && project.tech.length > 0) {
        await supabase
          .from('project_tech_stack')
          .insert(project.tech.map(tech => ({
            project_id: data.id,
            tech
          })));
      }

      await loadProjects();
      
      // Notificación cuando se crea un proyecto
      if (project.team && project.team.length > 0) {
        showNotification(
          'Nuevo Proyecto Creado',
          {
            body: `El proyecto "${project.name || 'Nuevo Proyecto'}" ha sido creado y has sido añadido al equipo`,
            tag: `project-${Date.now()}`
          }
        );
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  // Lead functions
  const updateLeadStage = async (id: string, stage: LeadStage) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ stage, last_contact: formatRelativeTime(new Date()) })
        .eq('id', id);

      if (error) throw error;
      await loadLeads();
    } catch (error) {
      console.error('Error updating lead stage:', error);
    }
  };

  const addLead = async (lead: Partial<Lead>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('leads')
        .insert({
          company_name: lead.companyName || '',
          contact_person: lead.contactPerson || '',
          value: lead.value || 0,
          stage: lead.stage || 'New',
          probability: lead.probability || 0,
          last_contact: formatRelativeTime(new Date()),
          created_by: user.id
        });

      if (error) throw error;
      await loadLeads();
    } catch (error) {
      console.error('Error adding lead:', error);
    }
  };

  // Task functions
  const toggleTaskStatus = async (id: string) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const newStatus = task.status === 'Done' ? 'Todo' : task.status === 'Todo' ? 'In Progress' : 'Done';
      
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      await loadTasks();
      
      // Notificación cuando se completa una tarea
      if (newStatus === 'Done') {
        showNotification(
          'Tarea Completada',
          {
            body: `La tarea "${task.title}" ha sido completada`,
            tag: `task-done-${id}`
          }
        );
      }
    } catch (error) {
      console.error('Error toggling task status:', error);
    }
  };

  const addTask = async (newTask: Partial<Task>) => {
    if (!user) return;
    
    try {
      const assigneeId = newTask.assigneeId || user.id;
      const assignee = users.find(u => u.id === assigneeId);
      const project = projects.find(p => p.id === (newTask.projectId || projects[0]?.id));
      
      const { error } = await supabase
        .from('tasks')
        .insert({
          title: newTask.title || 'New Task',
          project_id: newTask.projectId || projects[0]?.id || '',
          assignee_id: assigneeId,
          status: newTask.status || 'Todo',
          priority: newTask.priority || 'Medium',
          due_date: newTask.dueDate || new Date().toISOString().split('T')[0]
        });

      if (error) throw error;
      await loadTasks();
      
      // Mostrar notificación si está asignada a otro usuario o si las notificaciones están activas
      if (assigneeId !== user.id && assignee) {
        showNotification(
          'Nueva Tarea Asignada',
          {
            body: `Te han asignado la tarea "${newTask.title || 'Nueva Tarea'}" en ${project?.name || 'un proyecto'}`,
            tag: `task-${Date.now()}`
          }
        );
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  // Post functions
  const addPost = async (content: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content,
          timestamp: 'Just now',
          likes: 0,
          category: 'General'
        });

      if (error) throw error;
      await loadPosts();
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  // Transaction functions
  const addTransaction = async (t: Partial<Transaction>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          date: t.date || new Date().toISOString().split('T')[0],
          description: t.description || 'New Transaction',
          amount: t.amount || 0,
          type: t.type || 'Expense',
          category: t.category || 'General',
          status: t.status || 'Completed',
          created_by: user.id
        });

      if (error) throw error;
      await loadTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  // Subscription functions
  const addSubscription = async (sub: Partial<Subscription>) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          service: sub.service || 'New Service',
          cost: sub.cost || 0,
          cycle: sub.cycle || 'Monthly',
          renewal_date: sub.renewalDate || new Date().toISOString().split('T')[0],
          category: sub.category || 'Infrastructure'
        });

      if (error) throw error;
      await loadSubscriptions();
    } catch (error) {
      console.error('Error adding subscription:', error);
    }
  };

  // AI Resource functions
  const addAIResource = async (resource: Partial<AIResource>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_resources')
        .insert({
          title: resource.title || 'New Resource',
          type: resource.type || 'Prompt',
          content: resource.content || '',
          author_id: user.id,
          likes: 0
        })
        .select()
        .single();

      if (error) throw error;

      // Add tags if provided
      if (resource.tags && resource.tags.length > 0) {
        await supabase
          .from('ai_resource_tags')
          .insert(resource.tags.map(tag => ({
            resource_id: data.id,
            tag
          })));
      }

      await loadAIResources();
    } catch (error) {
      console.error('Error adding AI resource:', error);
    }
  };

  // Comment functions
  const addComment = async (postId: string, content: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content,
          timestamp: 'Just now'
        });

      if (error) throw error;
      await loadPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) return;
    
    try {
      // First delete all comments for this post
      const { error: commentsError } = await supabase
        .from('comments')
        .delete()
        .eq('post_id', postId);

      if (commentsError) throw commentsError;

      // Then delete the post
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      // Reload posts to update UI
      await loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  };

  const updatePost = async (postId: string, content: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('posts')
        .update({ content })
        .eq('id', postId);

      if (error) throw error;
      await loadPosts();
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      await loadPosts();
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('comments')
        .update({ content })
        .eq('id', commentId);

      if (error) throw error;
      await loadPosts();
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  };

  // Change password for current user
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error('No hay usuario autenticado');
    
    try {
      // Get user email from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        throw new Error('No se pudo obtener la información del usuario');
      }

      // First verify current password
      const { data: verifyData, error: verifyError } = await supabase.rpc('verify_password', {
        user_email: userData.email,
        password_plain: currentPassword
      });

      if (verifyError) throw verifyError;
      
      if (!verifyData || verifyData.length === 0 || verifyData[0].id !== user.id) {
        throw new Error('La contraseña actual es incorrecta');
      }

      // Update password using RPC function
      const { error: updateError } = await supabase.rpc('update_user_password', {
        user_id: user.id,
        new_password: newPassword
      });

      if (updateError) throw updateError;
    } catch (error: any) {
      console.error('Error changing password:', error);
      throw error;
    }
  };

  // Helpers
  const setUserRole = (role: Role) => {
    if (!user) return;
    setUser({ ...user, role });
  };

  return (
    <AppContext.Provider value={{
      // Auth
      user,
      setUser,
      originalUserRole,
      loading,
      signOut,
      loadUser,
      // Data
      users,
      projects,
      products,
      tasks,
      leads,
      subscriptions,
      financials,
      transactions,
      aiResources,
      posts,
      theme,
      setTheme,
      setUserRole,
      // Project functions
      updateProjectStatus,
      updateProjectDetails,
      deleteProject,
      createProject,
      // Lead functions
      updateLeadStage,
      addLead,
      // Task functions
      toggleTaskStatus,
      addTask,
      deleteTask,
      // Post functions
      addPost,
      deletePost,
      updatePost,
      // Transaction functions
      addTransaction,
      // Subscription functions
      addSubscription,
      // AI Resource functions
      addAIResource,
      // Comment functions
      addComment,
      deleteComment,
      updateComment,
      // Auth functions
      changePassword,
      // Product functions
      createProduct,
      updateProduct,
      deleteProduct,
      uploadProductImage,
      fetchVercelDeploymentStatus,
      // Load function
      loadAllData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useStore must be used within AppProvider");
  return context;
};
