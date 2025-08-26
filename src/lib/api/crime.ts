import { CrimeReport, CrimeReportFormData, CaseUpdate } from '@/types/crime';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Update to use complaints endpoints
class CrimeAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');

    const config: RequestInit = {
      headers: {
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

  async submitReport(data: CrimeReportFormData): Promise<CrimeReport> {
    const formData = new FormData();

    // Add complaint data as JSON string
    formData.append('complaintData', JSON.stringify({
      type: data.type,
      category: data.category,
      title: data.title,
      description: data.description,
      location: data.location,
      reporterInfo: data.reporterInfo,
    }));

    // Add files
    if (data.evidence?.files) {
      data.evidence.files.forEach((file) => {
        formData.append('files', file);
      });
    }

    return this.request<CrimeReport>('/complaints', {  // Changed from '/crime/report' to '/complaints'
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }

  async getReports(filters?: {
    status?: string;
    priority?: string;
    assignedOfficer?: string;
    reporterId?: string;
  }): Promise<CrimeReport[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    return this.request<CrimeReport[]>(`/complaints?${params.toString()}`);  // Already correct
  }

  async getReportById(id: string): Promise<CrimeReport> {
    return this.request<CrimeReport>(`/complaints/${id}`);  // Changed from '/crime/reports/${id}'
  }

  async updateReportStatus(id: string, status: CrimeReport['status'], message?: string): Promise<CrimeReport> {
    return this.request<CrimeReport>(`/complaints/${id}/status`, {  // Changed from '/crime/reports/${id}/status'
      method: 'PUT',  // Changed from 'PATCH' to 'PUT' to match server
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, message }),
    });
  }

  async assignOfficer(reportId: string, officerId: string): Promise<CrimeReport> {
    return this.request<CrimeReport>(`/complaints/${reportId}/assign`, {  // Changed from '/crime/reports/${reportId}/assign'
      method: 'PUT',  // Changed from 'PATCH' to 'PUT' to match server
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ officerId }),
    });
  }

  async getCaseUpdates(caseId: string): Promise<CaseUpdate[]> {
    return this.request<CaseUpdate[]>(`/crime/reports/${caseId}/updates`);
  }

  async getStatistics(): Promise<{
    total: number;
    pending: number;
    resolved: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>
  }> {
    return this.request('/crime/statistics');
  }
}

export const crimeAPI = new CrimeAPI();