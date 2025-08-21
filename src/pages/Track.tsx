<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, MapPin, Clock, User, FileText, 
  CheckCircle, AlertCircle, Eye, Download
} from 'lucide-react';
import SEO from '@/components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { complaintsAPI } from '@/lib/api/complaints';
import { Complaint, TimelineEvent } from '@/types/complaint';
import { useToast } from '@/hooks/use-toast';

const Track = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('case') || '');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (searchParams.get('case')) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a case number or phone number');
      return;
    }

    setLoading(true);
    setError('');
    setComplaint(null);
    setTimeline([]);

    try {
      const result = await complaintsAPI.trackComplaint(searchQuery);
      setComplaint(result);
      setTimeline(result.timeline);
    } catch (error: Error | unknown) {
      setError(error instanceof Error ? error.message : 'Case not found or access denied');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'investigating': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'created': return <FileText className="h-4 w-4" />;
      case 'assigned': return <User className="h-4 w-4" />;
      case 'updated': return <AlertCircle className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <SEO 
        title="Track Complaint — Police Positive" 
        description="Track the status of your complaint or case" 
        canonical="/track" 
      />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Track Your Complaint</h1>
        <p className="text-muted-foreground">
          Enter your case number or registered phone number to check the status of your complaint.
        </p>
      </div>

      {/* Search */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter case number (e.g., FIR/2024/001234) or phone number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Searching...' : 'Track'}
            </Button>
          </div>
          
          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {complaint && (
        <div className="space-y-6">
          {/* Case Overview */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {complaint.title}
                    <Badge variant="outline">{complaint.type}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Case Number: {complaint.caseNumber}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(complaint.status)}>
                    {complaint.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge className={getPriorityColor(complaint.priority)}>
                    {complaint.priority.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Incident Details</h4>
                    <p className="text-sm text-muted-foreground">{complaint.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </h4>
                    <p className="text-sm text-muted-foreground">{complaint.location.address}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Category</h4>
                    <Badge variant="secondary" className="capitalize">
                      {complaint.category}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Reported On</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(complaint.createdAt).toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Last Updated</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(complaint.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  
                  {complaint.assignedOfficer && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Assigned Officer
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        <p>{complaint.assignedOfficer.name}</p>
                        <p>Badge: {complaint.assignedOfficer.badgeNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {complaint.evidence.files.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Evidence Files</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {complaint.evidence.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {file.type} • {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Case Timeline</CardTitle>
              <CardDescription>
                Track the progress of your complaint from submission to resolution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                        {getTimelineIcon(event.type)}
                      </div>
                      {index < timeline.length - 1 && (
                        <div className="w-px h-8 bg-gray-200 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium capitalize">
                          {event.type.replace('_', ' ')}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {event.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        By: {event.userName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Help Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <h4 className="font-medium mb-2">Can't find your case?</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Make sure you're using the correct case number or registered phone number.
              </p>
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
            </div>
            
            <div className="text-center">
              <h4 className="font-medium mb-2">Update Required?</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Need to provide additional information or evidence?
              </p>
              <Button variant="outline" size="sm">
                Submit Update
              </Button>
            </div>
            
            <div className="text-center">
              <h4 className="font-medium mb-2">Emergency?</h4>
              <p className="text-sm text-muted-foreground mb-3">
                For urgent matters, contact emergency services immediately.
              </p>
              <Button variant="destructive" size="sm">
                📞 Call 100
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
=======
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Track = () => (
  <div className="container mx-auto py-12">
    <SEO title="Track Complaint — Police Positive" description="Check the status and priority of your complaint." canonical="/track" />
    <motion.h1 initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="text-3xl font-bold mb-6">
      Track Your Complaint
    </motion.h1>
    <div className="max-w-xl grid gap-4">
      <Input placeholder="Enter Case ID or Phone Number" />
      <Button>Check Status</Button>
      <div className="rounded-md border p-4 text-sm text-muted-foreground">
        Results will appear here (demo).
      </div>
    </div>
  </div>
);
>>>>>>> dev

export default Track;
