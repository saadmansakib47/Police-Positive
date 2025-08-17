// Re-export complaint types as crime types for consistency
export type {
  Complaint as CrimeReport,
  CreateComplaintData as CrimeReportFormData,
  TimelineEvent as CaseUpdate,
  FileEvidence,
  ComplaintFilters as CrimeReportFilters,
  DashboardStats as DashboardStatistics
} from './complaint';

// Additional crime-specific types
export interface CrimeLocation {
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  landmark?: string;
  district?: string;
}

export interface OfficerInfo {
  id: string;
  name: string;
  badgeNumber: string;
  department?: string;
  rank?: string;
  contactNumber?: string;
}

export interface CrimeStatistics {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  urgentReports: number;
  averageResolutionTime: number;
  reportsThisWeek: number;
  reportsThisMonth: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface AlertusNotification {
  id: string;
  type: 'emergency' | 'alert' | 'warning' | 'info';
  title: string;
  message: string;
  location?: CrimeLocation;
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetAudience: 'all' | 'officers' | 'supervisors' | 'civilians';
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface GeoTrackerData {
  reportId: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  accuracy?: number;
  timestamp: string;
  address: string;
  nearbyLandmarks?: string[];
}