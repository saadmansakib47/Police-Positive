import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  RotateCcw,
  BarChartIcon,
  PieChartIcon,
  LineChartIcon,
} from "lucide-react";
import SEO from "@/components/SEO";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { complaintsAPI } from "@/lib/api/complaints";
import { Complaint, Officer } from "@/types/complaint";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select as SelectComponent,
  SelectContent as SelectContentComponent,
  SelectItem as SelectItemComponent,
  SelectTrigger as SelectTriggerComponent,
  SelectValue as SelectValueComponent,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
];

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

interface ChartData {
  categoryData: { _id: string; count: number }[];
  statusData: { _id: string; count: number }[];
  priorityData: { _id: string; count: number }[];
  overTimeData: { _id: string; count: number }[];
  officerPerformanceData: any[];
  resolutionTimeData: any;
}

const Supervisor = () => {
  const [stats, setStats] = useState<CrimeStatistics | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [unassignedComplaints, setUnassignedComplaints] = useState<Complaint[]>(
    []
  );
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [noteText, setNoteText] = useState("");
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);
  const [newOfficerId, setNewOfficerId] = useState("");
  const [reassignReason, setReassignReason] = useState("");
  const [chartData, setChartData] = useState<ChartData>({
    categoryData: [],
    statusData: [],
    priorityData: [],
    overTimeData: [],
    officerPerformanceData: [],
    resolutionTimeData: {},
  });
  const [chartLoading, setChartLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const actualUser = (user as any)?.user || user;

  const getDateRange = () => {
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case "24h":
        startDate.setDate(now.getDate() - 1);
        break;
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    };
  };

  useEffect(() => {
    loadStatistics();
    loadComplaints();
    loadOfficers();
    loadUnassignedComplaints();
    loadChartData();
  }, [timeRange]);

  const loadChartData = async () => {
    setChartLoading(true);
    try {
      const { startDate, endDate } = getDateRange();

      const [
        categoryData,
        statusData,
        priorityData,
        overTimeData,
        officerPerformanceData,
        resolutionTimeData,
      ] = await Promise.all([
        complaintsAPI.getComplaintsByCategory(startDate, endDate),
        complaintsAPI.getComplaintsByStatus(startDate, endDate),
        complaintsAPI.getComplaintsByPriority(startDate, endDate),
        complaintsAPI.getComplaintsOverTime(startDate, endDate, "day"),
        complaintsAPI.getOfficerPerformance(startDate, endDate),
        complaintsAPI.getResolutionTimeStats(startDate, endDate),
      ]);

      setChartData({
        categoryData,
        statusData,
        priorityData,
        overTimeData,
        officerPerformanceData,
        resolutionTimeData,
      });
    } catch (error) {
      console.error("Error loading chart data:", error);
      toast({
        title: "Error loading chart data",
        description: "Failed to load report data",
        variant: "destructive",
      });
    } finally {
      setChartLoading(false);
    }
  };

  const loadUnassignedComplaints = async () => {
    try {
      const response = await complaintsAPI.getUnassignedComplaints();
      setUnassignedComplaints(response);
    } catch (error) {
      console.error("Error loading unassigned complaints:", error);
      toast({
        title: "Error loading unassigned complaints",
        description: "Failed to load unassigned complaint data",
        variant: "destructive",
      });
    }
  };

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
          closed: 0,
        },
        byPriority: {
          low: 0,
          medium: data.totalComplaints - data.highPriorityComplaints,
          high: data.highPriorityComplaints,
          urgent: 0,
        },
      };

      setStats(crimeStats);
    } catch (error) {
      toast({
        title: "Error loading statistics",
        description: "Failed to load dashboard data",
        variant: "destructive",
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
        variant: "destructive",
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
        variant: "destructive",
      });
      setOfficers([]);
    }
  };

  const handleAddNote = async () => {
    if (!selectedComplaint || !noteText.trim()) return;

    try {
      const updatedComplaint = await complaintsAPI.addNote(
        selectedComplaint.id,
        noteText
      );
      setComplaints(
        complaints.map((c) =>
          c.id === selectedComplaint.id ? updatedComplaint : c
        )
      );
      toast({
        title: "Note added",
        description: "Note successfully added to complaint",
      });
      setIsNoteDialogOpen(false);
      setNoteText("");
      setSelectedComplaint(null);
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Error adding note",
        description: "Failed to add note to complaint",
        variant: "destructive",
      });
    }
  };

  const handleReassignComplaint = async () => {
    if (!selectedComplaint || !newOfficerId) {
      toast({
        title: "Reassignment Error",
        description: "Please select an officer.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (reassignReason) {
        await complaintsAPI.addNote(
          selectedComplaint.id,
          `Reassigned by supervisor: ${reassignReason}`
        );
      }

      const updatedComplaint = await complaintsAPI.assignComplaint(
        selectedComplaint.id,
        newOfficerId
      );

      setComplaints(
        complaints.map((c) =>
          c.id === selectedComplaint.id ? updatedComplaint : c
        )
      );
      setUnassignedComplaints(
        unassignedComplaints.filter((c) => c.id !== selectedComplaint.id)
      );

      toast({
        title: "Complaint reassigned",
        description: "Complaint successfully reassigned to new officer",
      });

      setIsReassignDialogOpen(false);
      setNewOfficerId("");
      setReassignReason("");
      setSelectedComplaint(null);
    } catch (error) {
      console.error("Error reassigning complaint:", error);
      toast({
        title: "Error reassigning complaint",
        description: "Failed to reassign complaint",
        variant: "destructive",
      });
    }
  };

  const calculateAgingPriority = (complaint: Complaint) => {
    const createdDate = new Date(complaint.createdAt);
    const now = new Date();
    const diffInHours = (now.getTime() - createdDate.getTime()) / (1000 * 3600);

    if (diffInHours > 24) return "urgent";
    if (diffInHours > 12) return "high";
    if (diffInHours > 1) return "medium";
    return complaint.priority;
  };

  const getAgingComplaints = () => {
    return complaints
      .filter(
        (c) =>
          c.status !== "resolved" && c.status !== "closed" && c.assignedOfficer
      )
      .map((c) => ({
        ...c,
        agingPriority: calculateAgingPriority(c),
      }))
      .filter((c) => c.agingPriority !== c.priority) // Only show complaints that have aged
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  };

  const getNormalPriorityComplaints = () => {
    return complaints
      .filter(
        (c) =>
          c.status !== "resolved" && c.status !== "closed" && c.assignedOfficer
      )
      .map((c) => ({
        ...c,
        agingPriority: calculateAgingPriority(c),
      }))
      .filter((c) => c.agingPriority === c.priority) // Only show complaints that haven't aged
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  };

  const refreshAll = () => {
    loadStatistics();
    loadComplaints();
    loadUnassignedComplaints();
    loadChartData();
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
            Welcome, {actualUser?.firstName}. Monitor operations and analyze
            crime data.
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
          <Button onClick={refreshAll} variant="outline">
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
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingReports}
            </div>
            <p className="text-xs text-muted-foreground">
              {((stats.pendingReports / stats.totalReports) * 100).toFixed(1)}%
              of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resolved Cases
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.resolvedReports}
            </div>
            <p className="text-xs text-muted-foreground">
              {((stats.resolvedReports / stats.totalReports) * 100).toFixed(1)}%
              resolution rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Resolution
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.averageResolutionTime}h
            </div>
            <p className="text-xs text-muted-foreground">
              Average time to resolve
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Unassigned Complaints Section */}
      {unassignedComplaints.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Unassigned Complaints
            </CardTitle>
            <CardDescription>
              These complaints need to be assigned to an officer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unassignedComplaints.slice(0, 5).map((complaint) => (
                <div
                  key={complaint.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{complaint.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Case #{complaint.caseNumber} • Created{" "}
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Unassigned</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setIsReassignDialogOpen(true);
                      }}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Assign
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aging Complaints Section */}
      {getAgingComplaints().length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Priority Escalations
            </CardTitle>
            <CardDescription>
              These complaints have been unsolved for too long and require
              immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getAgingComplaints()
                .slice(0, 5)
                .map((complaint) => (
                  <div
                    key={complaint.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{complaint.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Case #{complaint.caseNumber} • Created{" "}
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">
                        Escalated to {complaint.agingPriority}
                      </Badge>
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

      {/* Normal Priority Complaints Section */}
      {getNormalPriorityComplaints().length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-600">
              <Clock className="h-5 w-5 mr-2" />
              Assigned Complaints (Normal Priority)
            </CardTitle>
            <CardDescription>
              These complaints are assigned and progressing normally
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getNormalPriorityComplaints()
                .slice(0, 5)
                .map((complaint) => (
                  <div
                    key={complaint.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{complaint.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Case #{complaint.caseNumber} • Created{" "}
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </p>
                      {complaint.assignedOfficer && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Assigned to: {complaint.assignedOfficer.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">
                        {complaint.priority.charAt(0).toUpperCase() +
                          complaint.priority.slice(1)}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedComplaint(complaint);
                          setIsNoteDialogOpen(true);
                        }}
                      >
                        Add Note
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChartIcon className="h-5 w-5 mr-2" />
            Analytics & Reports
          </CardTitle>
          <CardDescription>
            Visual insights into complaint patterns and officer performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="category" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="category" className="flex items-center gap-2">
                <PieChartIcon className="h-4 w-4" />
                By Category
              </TabsTrigger>
              <TabsTrigger value="status" className="flex items-center gap-2">
                <BarChartIcon className="h-4 w-4" />
                By Status
              </TabsTrigger>
              <TabsTrigger value="priority" className="flex items-center gap-2">
                <BarChartIcon className="h-4 w-4" />
                By Priority
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <LineChartIcon className="h-4 w-4" />
                Trends
              </TabsTrigger>
            </TabsList>

            <TabsContent value="category" className="mt-6">
              <div className="h-80">
                {chartLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="_id"
                        label={({ _id, percent }) =>
                          `${_id}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {chartData.categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, "Complaints"]} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </TabsContent>

            <TabsContent value="status" className="mt-6">
              <div className="h-80">
                {chartLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.statusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, "Complaints"]} />
                      <Bar dataKey="count" fill="#8884d8">
                        {chartData.statusData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </TabsContent>

            <TabsContent value="priority" className="mt-6">
              <div className="h-80">
                {chartLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.priorityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, "Complaints"]} />
                      <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </TabsContent>

            <TabsContent value="trends" className="mt-6">
              <div className="h-80">
                {chartLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.overTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, "Complaints"]} />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

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
                value={selectedComplaint?.caseNumber || ""}
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
              <Button
                variant="outline"
                onClick={() => setIsNoteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddNote}>Add Note</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reassign Complaint Dialog */}
      <Dialog
        open={isReassignDialogOpen}
        onOpenChange={(open) => {
          setIsReassignDialogOpen(open);
          if (!open) {
            // Reset form when dialog closes
            setNewOfficerId("");
            setReassignReason("");
            setSelectedComplaint(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedComplaint?.assignedOfficer
                ? "Reassign Complaint"
                : "Assign Complaint"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Case Number</label>
              <Input
                value={selectedComplaint?.caseNumber || ""}
                readOnly
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Select Officer</label>
              <SelectComponent
                value={newOfficerId}
                onValueChange={setNewOfficerId}
              >
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
              <label className="text-sm font-medium">
                {selectedComplaint?.assignedOfficer
                  ? "Reason for Reassignment"
                  : "Note for Assignment"}{" "}
                (Optional)
              </label>
              <Textarea
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
                placeholder="Enter reason for reassignment..."
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsReassignDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleReassignComplaint}>
                {selectedComplaint?.assignedOfficer
                  ? "Reassign Complaint"
                  : "Assign Complaint"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Supervisor;
