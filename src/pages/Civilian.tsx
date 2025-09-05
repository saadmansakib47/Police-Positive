import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Search,
  MessageCircle,
  MapPin,
  Phone,
  Shield,
  Clock,
  CheckCircle,
  TrendingUp,
  Target,
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
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { complaintsAPI } from "@/lib/api/complaints";
import { Complaint } from "@/types/complaint";
import { Trash2, Eye, Calendar, AlertCircle } from "lucide-react";
import Chatbox from "@/components/chat/Chatbox";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const Civilian = () => {
  const [myReports, setMyReports] = useState<Complaint[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    highPriorityComplaints: 0,
    averageResolutionTime: 0,
    complaintsThisWeek: 0,
    complaintsThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const [chatOpen, setChatOpen] = useState(false);

  const actualUser = (user as any)?.user || user;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reports, stats] = await Promise.all([
        complaintsAPI.getMyComplaints(),
        complaintsAPI.getDashboardStats(),
      ]);
      setMyReports(reports);
      setDashboardStats(stats);
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Failed to load your reports and dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyCall = () => {
    window.location.href = "tel:100";
  };

  const handlePanicButton = () => {
    toast({
      title: "Emergency Alert Sent",
      description: "Help is on the way. Stay safe and follow instructions.",
      variant: "destructive",
    });
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
        title="Civilian Portal — Police Positive"
        description="Citizen portal for reporting crimes and tracking complaints"
        canonical="/civilian"
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Civilian Portal</h1>
        <p className="text-muted-foreground">
          Welcome, {actualUser?.firstName}. Report incidents, track your
          complaints, and stay informed.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.totalComplaints}
            </div>
            <p className="text-xs text-muted-foreground">Total submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {dashboardStats.pendingComplaints}
            </div>
            <p className="text-xs text-muted-foreground">Under review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dashboardStats.resolvedComplaints}
            </div>
            <p className="text-xs text-muted-foreground">Completed cases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Resolution
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {dashboardStats.averageResolutionTime}h
            </div>
            <p className="text-xs text-muted-foreground">Time to resolve</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Report Crime
            </CardTitle>
            <CardDescription>
              File a new complaint or report an incident
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/report">File Report</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-green-600" />
              Track Complaint
            </CardTitle>
            <CardDescription>
              Check the status of your submitted reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/track">Track Status</Link>
            </Button>
          </CardContent>
        </Card>

        <div>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-purple-600" />
                AI Assistant
              </CardTitle>
              <CardDescription>
                Get help with reporting and legal guidance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setChatOpen(true)}
              >
                Chat Now
              </Button>
            </CardContent>
          </Card>
        </div>
        <Chatbox open={chatOpen} setOpen={setChatOpen} />

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-red-600" />
              Emergency
            </CardTitle>
            <CardDescription>
              Quick access to emergency services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                onClick={handleEmergencyCall}
                variant="destructive"
                className="w-full"
                size="sm"
              >
                📞 Call 100
              </Button>
              <Button
                onClick={handlePanicButton}
                variant="outline"
                className="w-full"
                size="sm"
              >
                🚨 Panic Button
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange-600" />
              Crime Map
            </CardTitle>
            <CardDescription>View crime incidents in your area</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              View Map (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              Safety Tips
            </CardTitle>
            <CardDescription>
              Learn about crime prevention and safety
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/safety-tips">View Safety Guide</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      {myReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Recent Reports</CardTitle>
            <CardDescription>
              Your latest submitted complaints and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myReports.slice(0, 5).map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{report.title}</h4>
                      <Badge variant="outline">{report.type}</Badge>
                      {report.priority === "high" ||
                      report.priority === "urgent" ? (
                        <Badge variant="destructive" className="text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          {report.priority.toUpperCase()}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Case: {report.caseNumber} •{" "}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {report.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge
                      className={`${
                        report.status === "closed"
                          ? "bg-green-100 text-green-800"
                          : report.status === "assigned"
                          ? "bg-blue-100 text-blue-800"
                          : report.status === "investigating"
                          ? "bg-purple-100 text-purple-800"
                          : report.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {report.status.replace("_", " ").toUpperCase()}
                    </Badge>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/track?case=${report.caseNumber}`}>
                        View Details
                      </Link>
                    </Button>

                    {/* Add delete button only for pending complaints */}
                    {report.status === "pending" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Complaint
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this complaint?
                              This action cannot be undone. Only pending
                              complaints can be deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                try {
                                  await complaintsAPI.deleteComplaint(
                                    report.id
                                  );
                                  setMyReports((prev) =>
                                    prev.filter((r) => r.id !== report.id)
                                  );
                                  toast({
                                    title: "Success",
                                    description:
                                      "Complaint deleted successfully",
                                  });
                                } catch (error) {
                                  toast({
                                    title: "Error",
                                    description: "Failed to delete complaint",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {myReports.length > 5 && (
              <div className="mt-4 text-center">
                <Button asChild variant="outline">
                  <Link to="/track">View All Reports</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {myReports.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Reports Yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't submitted any complaints yet. Get started by filing
              your first report.
            </p>
            <Button asChild>
              <Link to="/report">File Your First Report</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Civilian;
