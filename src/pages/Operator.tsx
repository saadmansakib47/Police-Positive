import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Clock,
  Users,
  MapPin,
  CheckCircle,
  Eye,
  UserCheck,
  Lock,
} from "lucide-react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { complaintsAPI } from "@/lib/api/complaints";
import { Complaint } from "@/types/complaint";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  assigned: "bg-blue-100 text-blue-800",
  investigating: "bg-purple-100 text-purple-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

const Operator = () => {
  const [allReports, setAllReports] = useState<Complaint[]>([]);
  const [myReports, setMyReports] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("-createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const actualUser = (user as any)?.user || user;

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    priorityFilter,
    statusFilter,
    categoryFilter,
    searchTerm,
    sortBy,
    sortOrder,
    pagination.currentPage,
  ]); // Remove user from deps to prevent loops

  const loadReports = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (priorityFilter !== "all") filters.priority = priorityFilter;
      if (statusFilter !== "all") filters.status = statusFilter;
      if (categoryFilter !== "all") filters.category = categoryFilter;
      if (searchTerm) filters.search = searchTerm;

      const allResponse = await complaintsAPI.getComplaints(
        filters,
        sortBy,
        sortOrder
      );
      setAllReports(allResponse.complaints);
      setPagination(allResponse.pagination);

      if (actualUser?._id) {
        const myResponse = await complaintsAPI.getMyOperatorComplaints();
        setMyReports(myResponse);
      } else {
        setMyReports([]);
      }
    } catch (error: any) {
      console.error("Error loading reports:", error);
      toast({
        title: "Error loading reports",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    reportId: string,
    newStatus: Complaint["status"]
  ) => {
    try {
      const updatedReport = await complaintsAPI.updateComplaintStatus(
        reportId,
        newStatus
      );
      setAllReports((prev) =>
        prev.map((r) => (r.id === reportId ? updatedReport : r))
      );
      setMyReports((prev) =>
        prev.map((r) => (r.id === reportId ? updatedReport : r))
      );
      toast({
        title: "Status Updated",
        description: "Report status has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Update Failed:", error);
      if (
        error.message?.includes("assigned") ||
        error.message?.includes("permission") ||
        error.message?.includes("Unauthorized")
      ) {
        toast({
          title: "Permission Denied",
          description:
            "You can only update the status of cases assigned to you.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Update Failed",
          description: error.message || "An unknown error occurred",
          variant: "destructive",
        });
      }
    }
  };

  const handleAssignToSelf = async (reportId: string) => {
    try {
      if (!actualUser?._id) throw new Error("User ID not found");
      const updatedReport = await complaintsAPI.assignComplaint(
        reportId,
        actualUser._id
      );
      setAllReports((prev) =>
        prev.map((r) => (r.id === reportId ? updatedReport : r))
      );
      setMyReports((prev) => {
        const exists = prev.some((r) => r.id === reportId);
        if (exists) {
          return prev.map((r) => (r.id === reportId ? updatedReport : r));
        } else {
          return [...prev, updatedReport];
        }
      });
      toast({
        title: "Case Assigned",
        description: "Case has been assigned to you.",
      });
    } catch (error: any) {
      console.error("Assignment Failed:", error);
      toast({
        title: "Assignment Failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const availableCategories = [
    "theft",
    "assault",
    "fraud",
    "domestic",
    "traffic",
    "cybercrime",
    "other",
  ];

  const stats = {
    total: pagination.totalItems,
    pending: allReports.filter((r) => r.status === "pending").length,
    urgent: allReports.filter((r) => r.priority === "urgent").length,
    myActive: myReports.filter(
      (r) => !["resolved", "closed"].includes(r.status)
    ).length,
  };

  const ReportCard = ({
    report,
    showAssignButton = false,
  }: {
    report: Complaint;
    showAssignButton?: boolean;
  }) => {
    const isAssignedToCurrentUser =
      actualUser?._id && report.assignedOfficer?.id === actualUser._id;
    const canEditStatus = isAssignedToCurrentUser;
    const canAssignToSelf =
      showAssignButton &&
      !report.assignedOfficer &&
      report.status === "pending";

    return (
      <Card key={report.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{report.title}</h3>
                <Badge variant="outline" className="text-xs">
                  {report.type.toUpperCase()}
                </Badge>
                {report.priority === "urgent" && (
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
                      {report.assignedOfficer.name ||
                        `Badge: ${report.assignedOfficer.badgeNumber}`}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {report.location.address}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {report.description}
              </p>
            </div>
            <div className="flex flex-col gap-2 mt-4 lg:mt-0 lg:ml-4">
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    statusColors[report.status] || "bg-gray-100 text-gray-800"
                  }
                >
                  <span className="capitalize">
                    {report.status.replace("_", " ")}
                  </span>
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    priorityColors[report.priority] ||
                    "bg-gray-100 text-gray-800"
                  }
                >
                  {report.priority.toUpperCase()}
                </Badge>
              </div>

              {/* Self-Assignment Button */}
              {canAssignToSelf && (
                <Button
                  onClick={() => handleAssignToSelf(report.id)}
                  variant="default"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Accept
                </Button>
              )}

              <div className="relative">
                <Select
                  value={report.status}
                  onValueChange={(value) =>
                    handleStatusUpdate(report.id, value as Complaint["status"])
                  }
                  disabled={!canEditStatus}
                >
                  <SelectTrigger
                    className={`w-[140px] h-8 ${
                      !canEditStatus ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    <SelectValue placeholder="Change Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                {!canEditStatus && (
                  <div
                    className="absolute -top-2 -right-2 text-muted-foreground"
                    title="Status can only be updated by the assigned officer"
                  >
                    <Lock className="h-4 w-4" />
                  </div>
                )}
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to={`/track?case=${report.caseNumber}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

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
        title="Operator Dashboard - Police Positive"
        description="Police operator dashboard for case management"
        canonical="/operator"
      />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Operator Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome, Officer {actualUser?.firstName}. Manage incoming reports and
          track investigations.
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
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Cases</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.urgent}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              My Active Cases
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.myActive}
            </div>
            <p className="text-xs text-muted-foreground">Assigned to me</p>
          </CardContent>
        </Card>
      </div>
      {/* Filters and Sorting */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by case number, title, or description..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to page 1 on search
                }}
                className="w-full"
              />
            </div>
            <Select
              value={priorityFilter}
              onValueChange={(value) => {
                setPriorityFilter(value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
            >
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
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
            >
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                setCategoryFilter(value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
            >
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Sorting Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Sort by:
              </span>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date Created (Asc)</SelectItem>
                  <SelectItem value="-createdAt">
                    Date Created (Desc)
                  </SelectItem>
                  <SelectItem value="priority">Priority (Asc)</SelectItem>
                  <SelectItem value="-priority">Priority (Desc)</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Reports Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            All Reports ({pagination.totalItems})
          </TabsTrigger>
          <TabsTrigger value="my-cases">
            My Cases ({myReports.length})
          </TabsTrigger>
          <TabsTrigger value="urgent">Urgent ({stats.urgent})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          {allReports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  No reports match your current filters.
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {allReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  showAssignButton={true}
                />
              ))}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-4">
                  <Button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <span>
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
        <TabsContent value="my-cases" className="space-y-4">
          {myReports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  No cases assigned to you yet.
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {myReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </>
          )}
        </TabsContent>
        <TabsContent value="urgent" className="space-y-4">
          {allReports.filter((r) => r.priority === "urgent").length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  No urgent cases at the moment.
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {allReports
                .filter((r) => r.priority === "urgent")
                .map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    showAssignButton={true}
                  />
                ))}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Operator;
