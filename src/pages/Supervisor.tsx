import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, Clock, CheckCircle, AlertTriangle, FileText, RotateCcw,
} from 'lucide-react';
import SEO from '@/components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { complaintsAPI } from '@/lib/api/complaints';
import { Complaint, Officer } from '@/types/complaint';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select as SelectComponent,
  SelectContent as SelectContentComponent,
  SelectItem as SelectItemComponent,
  SelectTrigger as SelectTriggerComponent,
  SelectValue as SelectValueComponent,
} from '@/components/ui/select';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface CrimeStatistics {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  averageResolutionTime: number;
  reportsThisWeek: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
}

const Supervisor = () => {
  const [stats, setStats] = useState<CrimeStatistics | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [noteText, setNoteText] = useState('');
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);
  const [newOfficerId, setNewOfficerId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadStatistics();
    loadComplaints();
    loadOfficers();
  }, [timeRange]);

  const loadStatistics = async () => {
    try {
      const data = await complaintsAPI.getDashboardStats();

      const crimeStats: CrimeStatistics = {
        totalReports: data.totalComplaints,
        pendingReports: data.pendingComplaints,
        resolvedReports: data.resolvedComplaints,
        averageResolutionTime: data.averageResolutionTime,
        reportsThisWeek: data.complaintsThisWeek,
        byCategory: {},
        byStatus: {
          pending: data.pendingComplaints,
          assigned: 0,
          investigating: 0,
          resolved: data.resolvedComplaints,
          closed: 0
        },
        byPriority: {
          low: 0,
          medium: data.totalComplaints - data.highPriorityComplaints,
          high: data.highPriorityComplaints,
          urgent: 0
        }
      };

      setStats(crimeStats);
    } catch (error) {
      toast({
        title: "Error loading statistics",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadComplaints = async () => {
    try {
      const response = await complaintsAPI.getComplaints();
      setComplaints(response.complaints);
    } catch (error) {
      toast({
        title: "Error loading complaints",
        description: "Failed to load complaint data",
        variant: "destructive"
      });
    }
  };

  const loadOfficers = async () => {
    try {
      const officerList = await complaintsAPI.getOfficers();
      setOfficers(officerList);
    } catch (error) {
      console.error("Error loading officers:", error);
      toast({
        title: "Error loading officers",
        description: "Failed to load officer list",
        variant: "destructive"
      });
      setOfficers([]);
    }
  };

  const handleAddNote = async () => {
    if (!selectedComplaint || !noteText.trim()) return;

    try {
      const updatedComplaint = await complaintsAPI.addNote(selectedComplaint.id, noteText);
      setComplaints(complaints.map(c =>
        c.id === selectedComplaint.id ? updatedComplaint : c
      ));
      toast({
        title: "Note added",
        description: "Note successfully added to complaint"
      });
      setIsNoteDialogOpen(false);
      setNoteText('');
      setSelectedComplaint(null);
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Error adding note",
        description: "Failed to add note to complaint",
        variant: "destructive"
      });
    }
  };

  const handleReassignComplaint = async () => {
    if (!selectedComplaint || !newOfficerId) {
      toast({
        title: "Reassignment Error",
        description: "Please select an officer.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (reassignReason) {
        await complaintsAPI.addNote(selectedComplaint.id, `Reassigned by supervisor: ${reassignReason}`);
      }

      const updatedComplaint = await complaintsAPI.assignComplaint(selectedComplaint.id, newOfficerId);
      setComplaints(complaints.map(c =>
        c.id === selectedComplaint.id ? updatedComplaint : c
      ));

      toast({
        title: "Complaint reassigned",
        description: "Complaint successfully reassigned to new officer"
      });

      setIsReassignDialogOpen(false);
      setNewOfficerId('');
      setReassignReason('');
      setSelectedComplaint(null);
    } catch (error) {
      console.error("Error reassigning complaint:", error);
      toast({
        title: "Error reassigning complaint",
        description: "Failed to reassign complaint",
        variant: "destructive"
      });
    }
  };


  const calculateAgingPriority = (complaint: Complaint) => {
    const createdDate = new Date(complaint.createdAt);
    const now = new Date();
    const diffInDays = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);

    if (diffInDays > 30) return 'urgent';
    if (diffInDays > 14) return 'high';
    if (diffInDays > 7) return 'medium';
    return complaint.priority;
  };

  const getAgingComplaints = () => {
    return complaints
      .filter(c => c.status !== 'resolved' && c.status !== 'closed')
      .map(c => ({
        ...c,
        agingPriority: calculateAgingPriority(c)
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  if (loading || !stats) {
    return (
      <div className="container mx-auto py-12">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const categoryData = Object.entries(stats.byCategory).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  const statusData = Object.entries(stats.byStatus).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
    value
  }));

  const priorityData = Object.entries(stats.byPriority).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  return (
    <div className="container mx-auto py-8">
      <SEO
        title="Supervisor Dashboard — Police Positive"
        description="Police supervisor dashboard with analytics and insights"
        canonical="/supervisor"
      />
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Supervisor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {user?.firstName}. Monitor operations and analyze crime data.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => { loadStatistics(); loadComplaints(); }} variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.reportsThisWeek} this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingReports}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.pendingReports / stats.totalReports) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Cases</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolvedReports}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.resolvedReports / stats.totalReports) * 100).toFixed(1)}% resolution rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.averageResolutionTime}h</div>
            <p className="text-xs text-muted-foreground">
              Average time to resolve
            </p>
          </CardContent>
        </Card>
      </div>

      {getAgingComplaints().length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Priority Escalations
            </CardTitle>
            <CardDescription>
              These complaints have been unsolved for too long and require immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getAgingComplaints().slice(0, 5).map((complaint) => (
                <div key={complaint.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{complaint.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Case #{complaint.caseNumber} • Created {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Escalated to {complaint.agingPriority}</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setIsReassignDialogOpen(true);
                      }}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Reassign
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts and Analytics */}

      {/* Add Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note to Complaint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Case Number</label>
              <Input
                value={selectedComplaint?.caseNumber || ''}
                readOnly
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Note</label>
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Enter note details..."
                className="mt-1"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNote}>
                Add Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reassign Complaint Dialog */}
      <Dialog open={isReassignDialogOpen} onOpenChange={(open) => {
        setIsReassignDialogOpen(open);
        if (!open) {
          // Reset form when dialog closes
          setNewOfficerId('');
          setReassignReason('');
          setSelectedComplaint(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Complaint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Case Number</label>
              <Input
                value={selectedComplaint?.caseNumber || ''}
                readOnly
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Select Officer</label>
              <SelectComponent value={newOfficerId} onValueChange={setNewOfficerId}> {/* Use UI library Select */}
                <SelectTriggerComponent className="mt-1">
                  <SelectValueComponent placeholder="Select an officer" />
                </SelectTriggerComponent>
                <SelectContentComponent>
                  {officers.length > 0 ? (
                    officers.map((officer) => (
                      <SelectItemComponent key={officer.id} value={officer.id}>
                        {officer.name} (Badge: {officer.badgeNumber})
                      </SelectItemComponent>
                    ))
                  ) : (
                    <SelectItemComponent value="no-officers" disabled>
                      No officers available
                    </SelectItemComponent>
                  )}
                </SelectContentComponent>
              </SelectComponent>
            </div>
            <div>
              <label className="text-sm font-medium">Reason for Reassignment (Optional)</label>
              <Textarea
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
                placeholder="Enter reason for reassignment..."
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsReassignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleReassignComplaint}>
                Reassign Complaint
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Supervisor;