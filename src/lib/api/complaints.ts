import { Complaint, CreateComplaintData, ComplaintFilters, DashboardStats } from '@/types/complaint';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ComplaintsAPI {
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

  async createComplaint(data: CreateComplaintData): Promise<Complaint> {
    const formData = new FormData();
    
    // Add complaint data
    formData.append('complaintData', JSON.stringify({
      type: data.type,
      category: data.category,
      title: data.title,
      description: data.description,
      location: data.location,
      reporterInfo: data.reporterInfo,
    }));
    
    // Add files if any
    if (data.evidence?.files) {
      data.evidence.files.forEach((file, index) => {
        formData.append(`files`, file);
      });
    }

    return this.request<Complaint>('/complaints', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }

  async getComplaints(filters?: ComplaintFilters): Promise<Complaint[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else if (typeof value === 'object') {
            params.append(key, JSON.stringify(value));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    const queryString = params.toString();
    return this.request<Complaint[]>(`/complaints${queryString ? `?${queryString}` : ''}`);
  }

  async getComplaintById(id: string): Promise<Complaint> {
    return this.request<Complaint>(`/complaints/${id}`);
  }

  async updateComplaintStatus(id: string, status: Complaint['status'], note?: string): Promise<Complaint> {
    return this.request<Complaint>(`/complaints/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  }

  async assignComplaint(id: string, officerId: string): Promise<Complaint> {
    return this.request<Complaint>(`/complaints/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ officerId }),
    });
  }

  async addNote(id: string, note: string): Promise<Complaint> {
    return this.request<Complaint>(`/complaints/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/complaints/stats');
  }

  async getMyComplaints(): Promise<Complaint[]> {
    return this.request<Complaint[]>('/complaints/my');
  }

  async trackComplaint(identifier: string): Promise<Complaint | null> {
    return this.request<Complaint | null>(`/complaints/track/${identifier}`);
  }
}

export const complaintsAPI = new ComplaintsAPI();