import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Clock, 
  Users, 
  MapPin, 
  Filter, 
  Search,
  CheckCircle,
  Eye,
  UserCheck
} from 'lucide-react';
import SEO from '@/components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { crimeAPI } from '@/lib/api/crime';
import { CrimeReport } from '@/types/crime';
import { useToast } from '@/hooks/use-toast';

// Update status mapping to match complaint.ts
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',  // Changed from 'under_review'
  investigating: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const Operator = () => {
  const [allReports, setAllReports] = useState<CrimeReport[]>([]);
  const [myReports, setMyReports] = useState<CrimeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const [all, assigned] = await Promise.all([
        crimeAPI.getReports(),
        crimeAPI.getReports({ assignedOfficer: user?.id })
      ]);
      setAllReports(all);
      setMyReports(assigned);
    } catch (error: Error | unknown) {
      toast({
        title: "Error loading reports",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId: string, newStatus: CrimeReport['status']) => {
    try {
      await crimeAPI.updateReportStatus(reportId, newStatus);
      await loadReports();
      toast({
        title: "Status Updated",
        description: "Report status has been updated successfully."
      });
    } catch (error: Error | unknown) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const handleAssignToSelf = async (reportId: string) => {
    try {
      await crimeAPI.assignOfficer(reportId, user?.id || '');
      await loadReports();
      toast({
        title: "Case Assigned",
        description: "Case has been assigned to you."
      });
    } catch (error: Error | unknown) {
      toast({
        title: "Assignment Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const filterReports = (reports: CrimeReport[]) => {
    let filtered = reports;
    
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(report => report.priority === priorityFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }
    
    return filtered.sort((a, b) => {
      // Sort by priority first, then by creation date
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const stats = {
    total: allReports.length,
    pending: allReports.filter(r => r.status === 'pending').length,
    urgent: allReports.filter(r => r.priority === 'urgent').length,
    myActive: myReports.filter(r => !['resolved', 'closed'].includes(r.status)).length,
  };

  const ReportCard = ({ report, showAssignButton = false }: { report: CrimeReport; showAssignButton?: boolean }) => (
    <Card key={report.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">{report.title}</h3>
              <Badge variant="outline" className="text-xs">
                {report.type.toUpperCase()}
              </Badge>
              {report.priority === 'urgent' && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  URGENT
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <span>Case: {report.caseNumber}</span>
              <span>•</span>
              <span>{new Date(report.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span className="capitalize">{report.category}</span>
              {report.assignedOfficer && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <UserCheck className="h-3 w-3" />
                    Assigned
                  </span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{report.location.address}</span>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {report.description}
            </p>
          </div>
          
          <div className="flex flex-col gap-2 mt-4 lg:mt-0 lg:ml-4">
            <div className="flex items-center gap-2">
              <Badge className={statusColors[report.status]}>
                <span className="capitalize">{report.status.replace('_', ' ')}</span>
              </Badge>
              
              <Badge variant="outline" className={priorityColors[report.priority]}>
                {report.priority.toUpperCase()}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              {showAssignButton && !report.assignedOfficer && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleAssignToSelf(report.id)}
                >
                  Assign to Me
                </Button>
              )}
              
              <Select 
                value={report.status} 
                onValueChange={(value) => handleStatusUpdate(report.id, value as CrimeReport['status'])}
              >
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue />
                </SelectTrigger>
                // Update status select options
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              
              <Button asChild variant="outline" size="sm">
                <Link to={`/track?case=${report.caseNumber}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <SEO 
        title="Operator Dashboard — Police Positive" 
        description="Police operator dashboard for case management" 
        canonical="/operator" 
      />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Operator Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome, Officer {user?.name}. Manage incoming reports and track investigations.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All active cases</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Cases</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Active Cases</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.myActive}</div>
            <p className="text-xs text-muted-foreground">Assigned to me</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by case number, title, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Reports ({allReports.length})</TabsTrigger>
          <TabsTrigger value="my-cases">My Cases ({myReports.length})</TabsTrigger>
          <TabsTrigger value="urgent">Urgent ({stats.urgent})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {filterReports(allReports).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  No reports match your current filters.
                </div>
              </CardContent>
            </Card>
          ) : (
            filterReports(allReports).map((report) => (
              <ReportCard key={report.id} report={report} showAssignButton={true} />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="my-cases" className="space-y-4">
          {filterReports(myReports).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  No cases assigned to you yet.
                </div>
              </CardContent>
            </Card>
          ) : (
            filterReports(myReports).map((report) => (
              <ReportCard key={report.id} report={report} />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="urgent" className="space-y-4">
          {filterReports(allReports.filter(r => r.priority === 'urgent')).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  No urgent cases at the moment.
                </div>
              </CardContent>
            </Card>
          ) : (
            filterReports(allReports.filter(r => r.priority === 'urgent')).map((report) => (
              <ReportCard key={report.id} report={report} showAssignButton={true} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Operator;
