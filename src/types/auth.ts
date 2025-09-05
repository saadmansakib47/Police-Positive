export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "civilian" | "operator" | "supervisor" | "patrol";
  badgeNumber?: string; // For police roles
  department?: string; // For police roles
  phone?: string; // Optional for anyone
  address?: string; // Optional for civilians (frontend only)
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
  firstName: string;
  lastName: string;
  role: "civilian" | "operator" | "supervisor" | "patrol";
  address?: string; // optional frontend-only
  badgeNumber?: string;
  department?: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
