import { Complaint, CreateComplaintData, ComplaintFilters, DashboardStats, TimelineEvent, FileEvidence, Officer } from '@/types/complaint';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ComplaintsAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    const token = localStorage.getItem('token');

    const headers: any = {
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
  async getComplaints(filters?: ComplaintFilters, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{ complaints: Complaint[]; pagination: any }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else if (typeof value === 'object') {
            // Handle dateRange specifically
            if (key === 'dateRange' && value.from && value.to) {
              params.append('startDate', value.from);
              params.append('endDate', value.to);
            } else {
              params.append(key, JSON.stringify(value));
            }
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    if (sortBy) {
      params.append('sortBy', sortBy);
    }
    if (sortOrder) {
      params.append('sortOrder', sortOrder);
    }

    const queryString = params.toString();

    return this.request<{ complaints: Complaint[]; pagination: any }>(`/complaints${queryString ? `?${queryString}` : ''}`);
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
    return this.request<Complaint[]>('/complaints/my-civilian');
  }

  async getUnassignedComplaints(): Promise<Complaint[]> {
    return this.request<Complaint[]>('/complaints/unassigned');
  }

  async getMyOperatorComplaints(): Promise<Complaint[]> {
    return this.request<Complaint[]>('/complaints/my-operator');
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
      const response = await this.request<{
        complaint: Complaint | null;
        timeline: TimelineEvent[];
        evidence: FileEvidence[];
        error: string | null;
      }>(`/complaints/track/${encodedCaseNumber}`);

      if (response.error || !response.complaint) {
        throw new Error(response.error || 'Case not found');
      }

      // Ensure the complaint object has all required properties
      const complaint: Complaint = {
        id: response.complaint.id || '',
        caseNumber: response.complaint.caseNumber || '',
        type: response.complaint.type || 'GD',
        category: response.complaint.category || 'other',
        title: response.complaint.title || '',
        description: response.complaint.description || '',
        location: {
          address: response.complaint.location?.address || '',
          lat: response.complaint.location?.lat || 0,
          lng: response.complaint.location?.lng || 0,
        },
        reporterInfo: response.complaint.reporterInfo || {
          isAnonymous: false,
          phone: ''
        },
        status: response.complaint.status || 'pending',
        priority: response.complaint.priority || 'medium',
        assignedOfficer: response.complaint.assignedOfficer,
        evidence: {
          files: response.evidence || response.complaint.evidence?.files || [],
          notes: response.complaint.evidence?.notes || [],
        },
        timeline: response.timeline || [],
        createdAt: response.complaint.createdAt || new Date().toISOString(),
        updatedAt: response.complaint.updatedAt || new Date().toISOString(),
        createdBy: response.complaint.createdBy || '',
      };

      return complaint;
    } catch (err) {
      console.error('Error tracking complaint:', err);
      return null;
    }
  }


  // -------------------------
  // Fetch Officers
  // -------------------------
  async getOfficers(): Promise<Officer[]> {
    return this.request<Officer[]>('/users/officers');
  }

  async deleteComplaint(id: string): Promise<void> {
    return this.request<void>(`/complaints/${id}`, {
      method: 'DELETE',
    });
  }

  // ---------------------------
  // Reports Methods
  // ---------------------------
  async getComplaintsByCategory(startDate?: string, endDate?: string): Promise<{ _id: string, count: number }[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return this.request<{ _id: string, count: number }[]>(`/complaints/reports/category?${params.toString()}`);
  }

  async getComplaintsByStatus(startDate?: string, endDate?: string): Promise<{ _id: string, count: number }[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return this.request<{ _id: string, count: number }[]>(`/complaints/reports/status?${params.toString()}`);
  }

  async getComplaintsByPriority(startDate?: string, endDate?: string): Promise<{ _id: string, count: number }[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return this.request<{ _id: string, count: number }[]>(`/complaints/reports/priority?${params.toString()}`);
  }

  async getComplaintsOverTime(startDate?: string, endDate?: string, interval?: string): Promise<{ _id: string, count: number }[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (interval) params.append('interval', interval);

    return this.request<{ _id: string, count: number }[]>(`/complaints/reports/over-time?${params.toString()}`);
  }

  async getOfficerPerformance(startDate?: string, endDate?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return this.request<any[]>(`/complaints/reports/officer-performance?${params.toString()}`);
  }

  async getResolutionTimeStats(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return this.request<any>(`/complaints/reports/resolution-time?${params.toString()}`);
  }
}



export const complaintsAPI = new ComplaintsAPI();