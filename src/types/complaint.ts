export interface Complaint {
  id: string;
  caseNumber: string;
  type: 'GD' | 'FIR';
  category: 'theft' | 'assault' | 'fraud' | 'domestic' | 'traffic' | 'cybercrime' | 'other';
  title: string;
  description: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  reporterInfo: {
    name?: string;
    phone: string;
    email?: string;
    isAnonymous: boolean;
  };
  status: 'pending' | 'assigned' | 'investigating' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedOfficer?: {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    badgeNumber: string;
  };
  evidence: {
    files: FileEvidence[];
    notes: Array<{ text: string; createdAt: string; by: string | null }>;
  };
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface FileEvidence {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  size: number;
  uploadedAt: string;
}

export interface TimelineEvent {
  id: string;
  type: 'created' | 'assigned' | 'updated' | 'resolved' | 'note_added';
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
}

export interface CreateComplaintData {
  type: 'GD' | 'FIR';
  category: Complaint['category'];
  title: string;
  description: string;
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  reporterInfo: {
    name?: string;
    phone: string;
    email?: string;
    isAnonymous: boolean;
  };
  evidence?: {
    files: File[];
    notes?: string[];
  };
}

export interface ComplaintFilters {
  status?: Complaint['status'][];
  priority?: Complaint['priority'][];
  category?: Complaint['category'][];
  dateRange?: {
    from: string;
    to: string;
  };
  assignedOfficer?: string;
  search?: string;
}

export interface DashboardStats {
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  highPriorityComplaints: number;
  averageResolutionTime: number;
  complaintsThisWeek: number;
  complaintsThisMonth: number;
}

export interface Officer {
  id: string;
  name: string;
  badgeNumber: string;
}