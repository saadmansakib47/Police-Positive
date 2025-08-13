export interface User {
  id: string;
  email: string;
  name: string;
  role: 'civilian' | 'operator' | 'supervisor';
  badgeNumber?: string; // For police officers
  department?: string; // For police officers
  phone?: string;
  address?: string; // For civilians
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'civilian' | 'operator' | 'supervisor';
  phone?: string;
  badgeNumber?: string;
  department?: string;
  address?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}