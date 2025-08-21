<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  MessageCircle, 
  Bell, 
  MapPin, 
  Phone, 
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle
} from 'lucide-react';
import SEO from '@/components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { complaintsAPI } from '@/lib/api/complaints';
import { Complaint } from '@/types/complaint';
import { AlertusNotification } from '@/types/crime';
import { useToast } from '@/hooks/use-toast';

const Civilian = () => {
  const [myReports, setMyReports] = useState<Complaint[]>([]);
  const [notifications, setNotifications] = useState<AlertusNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reports, alerts] = await Promise.all([
        complaintsAPI.getMyReports(),
        complaintsAPI.getActiveAlerts()
      ]);
      setMyReports(reports);
      setNotifications(alerts);
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Failed to load your reports and notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: myReports.length,
    pending: myReports.filter(r => r.status === 'pending').length,
    resolved: myReports.filter(r => r.status === 'resolved').length,
    activeAlerts: notifications.filter(n => n.isActive).length
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
          Welcome, {user?.name}. Report incidents, track your complaints, and stay informed.
        </p>
      </div>

      {/* Active Alerts */}
      {notifications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">🚨 Active Alerts</h2>
          <div className="space-y-3">
            {notifications.slice(0, 3).map((alert) => (
              <Alert key={alert.id} className={`border-l-4 ${
                alert.priority === 'critical' ? 'border-red-500 bg-red-50' :
                alert.priority === 'high' ? 'border-orange-500 bg-orange-50' :
                'border-yellow-500 bg-yellow-50'
              }`}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <div>
                      <strong>{alert.title}</strong>
                      <p className="text-sm mt-1">{alert.message}</p>
                      {alert.location && (
                        <p className="text-xs text-muted-foreground mt-1">
                          📍 {alert.location.address}
                        </p>
                      )}
                    </div>
                    <Badge variant={alert.priority === 'critical' ? 'destructive' : 'secondary'}>
                      {alert.priority.toUpperCase()}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total submitted</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Under review</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">Completed cases</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.activeAlerts}</div>
            <p className="text-xs text-muted-foreground">In your area</p>
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
            <Button variant="outline" className="w-full" disabled>
              Chat Now (Coming Soon)
            </Button>
          </CardContent>
        </Card>

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
              <Button variant="destructive" className="w-full" size="sm">
                📞 Call 100
              </Button>
              <Button variant="outline" className="w-full" size="sm">
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
            <CardDescription>
              View crime incidents in your area
            </CardDescription>
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
            <Button variant="outline" className="w-full" disabled>
              Learn More (Coming Soon)
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
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{report.title}</h4>
                      <Badge variant="outline">{report.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Case: {report.caseNumber} • {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {report.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${
                      report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      report.status === 'investigating' ? 'bg-blue-100 text-blue-800' :
                      report.status === 'assigned' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/track?case=${report.caseNumber}`}>
                        View Details
                      </Link>
                    </Button>
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
    </div>
  );
};
=======
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Civilian = () => (
  <div className="container mx-auto py-12">
    <SEO title="Civilian Portal — Police Positive" description="Report, track, and get AI assistance." canonical="/civilian" />
    <motion.h1 initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="text-3xl font-bold mb-6">
      Civilian Portal
    </motion.h1>
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader><CardTitle>Report Crime</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Submit GD or FIR with media uploads.</p>
          <Link to="/report"><Button>Report</Button></Link>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Track Complaint</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Follow your case priority and status.</p>
          <Link to="/track"><Button variant="secondary">Track</Button></Link>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>AI Chatbot</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-2">Consult if your case qualifies as GD or FIR.</p>
          <p className="text-xs text-muted-foreground">(Demo placeholder)</p>
        </CardContent>
      </Card>
    </div>
  </div>
);
>>>>>>> dev

export default Civilian;
