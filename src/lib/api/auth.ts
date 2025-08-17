import { LoginCredentials, RegisterData, AuthResponse, User } from '@/types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class AuthAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    // Handle unknown form sending 'name' instead of firstName/lastName
    let firstName = data.firstName;
    let lastName = data.lastName;

    if (!firstName && data.name) {
      const [f, ...rest] = data.name.split(' ');
      firstName = f;
      lastName = rest.join(' ') || '';
    }

    const body = {
      email: data.email,
      password: data.password,
      firstName,
      lastName,
      role: data.role,
      badgeNumber: data.badgeNumber,
      department: data.department,
      phone: data.phone,
    };

    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async verifyToken(token: string): Promise<User> {
    return this.request<User>('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async refreshToken(): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
    });
  }
}

export const authAPI = new AuthAPI();
