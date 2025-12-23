export type Role = 'Founder' | 'CTO' | 'Developer' | 'Sales' | 'CFO' | 'Client';

export type User = {
  id: string;
  name: string;
  avatar: string;
  role: Role;
};

export type Theme = 'dark' | 'light' | 'system';

export type ProjectStatus = 'Proposal' | 'In Development' | 'Testing' | 'Delivered' | 'Maintenance';

export type TechStack = 'React' | 'Node' | 'Python' | 'TensorFlow' | 'OpenAI' | 'Next.js' | 'AWS' | 'Solidity';

export interface Project {
  id: string;
  name: string;
  clientName: string;
  clientLogo: string;
  status: ProjectStatus;
  progress: number;
  dueDate: string;
  budget: number;
  team: string[]; // User IDs
  tech: TechStack[];
  description: string;
  lastUpdate: string;
  managerNotes?: string; // New field for status updates
  url?: string; // Direct link to the project (legacy, use productUrl)
  isStarred?: boolean; // Mark as featured/starred project
  // Central Elevate fields
  gitRepoUrl?: string; // Link to Git repository
  vercelUrl?: string; // Link to Vercel deployment
  productUrl?: string; // Link to the actual product
  currentStatus?: string; // Current status editable by CTO (e.g., "Active", "Maintenance", "Beta")
  features?: string[]; // Features/characteristics of the project
}

export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Todo' | 'In Progress' | 'Done';

export interface Task {
  id: string;
  title: string;
  projectId: string;
  assigneeId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
}

export type LeadStage = 'New' | 'Contacted' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

export interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  value: number;
  stage: LeadStage;
  probability: number; // 0-100
  lastContact: string;
}

export interface Subscription {
  id: string;
  service: string;
  cost: number;
  cycle: 'Monthly' | 'Yearly';
  renewalDate: string;
  category: 'Infrastructure' | 'Design' | 'AI' | 'Management';
}

export interface Metric {
  label: string;
  value: string | number;
  change: number; // Percentage
  trend: 'up' | 'down' | 'neutral';
}

export interface FinancialRecord {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export type TransactionType = 'Income' | 'Expense';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  status: 'Pending' | 'Completed';
}

export interface AIResource {
  id: string;
  title: string;
  type: 'Prompt' | 'Snippet' | 'ModelConfig';
  content: string;
  tags: string[];
  authorId: string;
  likes: number;
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  timestamp: string;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  category: 'General' | 'Announcement' | 'ProjectUpdate';
  mentions?: string[]; // Array of user IDs mentioned in the post
  isEveryoneTagged?: boolean; // True if @everyone was tagged
}

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl?: string; // Photo/image of the product
  currentStatus?: string; // Current status (e.g., "Active", "Maintenance", "Beta")
  gitRepoUrl?: string; // Link to Git repository
  vercelUrl?: string; // Link to Vercel deployment
  vercelProjectId?: string; // Vercel project ID for API integration
  vercelTeamId?: string; // Vercel Team ID (required if project is in a team)
  productUrl?: string; // Link to the actual product
  features?: string[]; // Features/characteristics
  isStarred?: boolean; // Mark as featured/starred
  vercelDeploymentStatus?: 'READY' | 'ERROR' | 'BUILDING' | 'QUEUED' | 'CANCELED' | null; // Status from Vercel API
  vercelLastDeployment?: string; // Last deployment time from Vercel
  gitLastCommit?: string; // Last commit/update from Git API
  gitStars?: number; // Number of stars from Git API
  gitLanguage?: string; // Primary language from Git API
  createdAt?: string;
  updatedAt?: string;
}