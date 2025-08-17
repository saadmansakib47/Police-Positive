import { Complaint, CreateComplaintData, ComplaintFilters, DashboardStats } from '@/types/complaint';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ComplaintsAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Ensure endpoint always starts with '/'
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    const token = localStorage.getItem('token');

    const headers: Record<string, string> = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, { ...options, headers });

    // Handle empty 204 or empty JSON
    if (response.status === 204) return null as any;

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  // -------------------------
  // Create Complaint
  // -------------------------
  async createComplaint(data: CreateComplaintData): Promise<Complaint> {
    const formData = new FormData();

    const locationPayload = {
      address: data.location.address,
      lat: Number(data.location.coordinates?.lat),
      lng: Number(data.location.coordinates?.lng),
    };

    formData.append(
      'complaintData',
      JSON.stringify({
        type: data.type,
        category: data.category,
        title: data.title,
        description: data.description,
        location: locationPayload,
        reporterInfo: data.reporterInfo,
      })
    );

    if (data.evidence?.files) {
      data.evidence.files.forEach(file => {
        formData.append('files', file);
      });
    }

    return this.request<Complaint>('/complaints', {
      method: 'POST',
      body: formData,
    });
  }

  // -------------------------
  // Other API methods
  // -------------------------
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

  // -------------------------
  // Track Complaint by Case Number (bulletproof)
  // -------------------------
  async trackComplaint(caseNumber: string): Promise<Complaint | null> {
    if (!caseNumber || caseNumber.trim().length < 3) {
      // early return for invalid case number
      return null;
    }

    // Encode in case caseNumber has special characters
    const encodedCaseNumber = encodeURIComponent(caseNumber.trim());

    try {
      return this.request<Complaint | null>(`/complaints/track/${encodedCaseNumber}`);
    } catch (err) {
      console.error('Error tracking complaint:', err);
      return null;
    }
  }
}

export const complaintsAPI = new ComplaintsAPI();
