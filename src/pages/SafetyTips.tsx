import { ArrowLeft, Shield, AlertCircle, Phone, Eye, Home, Car, Users, Smartphone, Lock, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SafetyTips = () => {
  return (
    <div className="container mx-auto py-8">
      <SEO
        title="Safety Tips — Police Positive"
        description="Comprehensive safety guidelines and crime prevention tips for civilians"
        canonical="/safety-tips"
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/civilian">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Shield className="h-8 w-8 text-indigo-600" />
          Safety Tips & Crime Prevention
        </h1>
        <p className="text-muted-foreground">
          Essential safety guidelines to protect yourself, your family, and your property.
        </p>
      </div>

      {/* Emergency Contacts */}
      <Card className="mb-8 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Phone className="h-5 w-5" />
            Emergency Contacts
          </CardTitle>
          <CardDescription className="text-red-600">
            Keep these numbers handy at all times
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <Phone className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <h3 className="font-bold text-lg">Police</h3>
              <p className="text-2xl font-bold text-red-600">100</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <Phone className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-bold text-lg">Fire Department</h3>
              <p className="text-2xl font-bold text-orange-600">101</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <Phone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-bold text-lg">Ambulance</h3>
              <p className="text-2xl font-bold text-blue-600">102</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Personal Safety */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Personal Safety
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">1</Badge>
                <div>
                  <h4 className="font-medium">Stay Alert & Aware</h4>
                  <p className="text-sm text-muted-foreground">Keep your head up, avoid distractions like phones when walking alone</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">2</Badge>
                <div>
                  <h4 className="font-medium">Trust Your Instincts</h4>
                  <p className="text-sm text-muted-foreground">If something feels wrong, remove yourself from the situation</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">3</Badge>
                <div>
                  <h4 className="font-medium">Avoid Isolated Areas</h4>
                  <p className="text-sm text-muted-foreground">Stick to well-lit, populated areas, especially at night</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">4</Badge>
                <div>
                  <h4 className="font-medium">Share Your Location</h4>
                  <p className="text-sm text-muted-foreground">Let someone know where you're going and when you expect to return</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Home Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-green-600" />
              Home Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">1</Badge>
                <div>
                  <h4 className="font-medium">Lock All Entry Points</h4>
                  <p className="text-sm text-muted-foreground">Always lock doors and windows, even when home</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">2</Badge>
                <div>
                  <h4 className="font-medium">Install Security Systems</h4>
                  <p className="text-sm text-muted-foreground">Consider alarms, cameras, and motion-sensor lights</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">3</Badge>
                <div>
                  <h4 className="font-medium">Know Your Neighbors</h4>
                  <p className="text-sm text-muted-foreground">Build relationships for mutual security awareness</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">4</Badge>
                <div>
                  <h4 className="font-medium">Secure Valuables</h4>
                  <p className="text-sm text-muted-foreground">Keep expensive items out of sight from windows</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Safety */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-purple-600" />
              Vehicle Safety
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">1</Badge>
                <div>
                  <h4 className="font-medium">Lock Your Vehicle</h4>
                  <p className="text-sm text-muted-foreground">Always lock doors and close windows completely</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">2</Badge>
                <div>
                  <h4 className="font-medium">Park in Safe Areas</h4>
                  <p className="text-sm text-muted-foreground">Choose well-lit, busy areas with good visibility</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">3</Badge>
                <div>
                  <h4 className="font-medium">Hide Valuables</h4>
                  <p className="text-sm text-muted-foreground">Don't leave bags, electronics, or valuables visible</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">4</Badge>
                <div>
                  <h4 className="font-medium">Stay Alert While Driving</h4>
                  <p className="text-sm text-muted-foreground">Keep doors locked, be aware of surroundings at stops</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Online Safety */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-orange-600" />
              Online & Digital Safety
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">1</Badge>
                <div>
                  <h4 className="font-medium">Protect Personal Information</h4>
                  <p className="text-sm text-muted-foreground">Don't share sensitive details on social media</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">2</Badge>
                <div>
                  <h4 className="font-medium">Verify Online Identities</h4>
                  <p className="text-sm text-muted-foreground">Be cautious of strangers requesting meetings</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">3</Badge>
                <div>
                  <h4 className="font-medium">Use Strong Passwords</h4>
                  <p className="text-sm text-muted-foreground">Enable two-factor authentication where possible</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">4</Badge>
                <div>
                  <h4 className="font-medium">Report Suspicious Activity</h4>
                  <p className="text-sm text-muted-foreground">Report cybercrime, fraud, or online harassment</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* What to Do in Emergency */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            What to Do in an Emergency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-red-700">If You're a Victim of Crime:</h3>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-2"><Badge variant="destructive" className="text-xs">1</Badge> Ensure your immediate safety first</li>
                <li className="flex gap-2"><Badge variant="destructive" className="text-xs">2</Badge> Call emergency services (100) if needed</li>
                <li className="flex gap-2"><Badge variant="destructive" className="text-xs">3</Badge> Don't touch or move evidence</li>
                <li className="flex gap-2"><Badge variant="destructive" className="text-xs">4</Badge> Note details: time, location, descriptions</li>
                <li className="flex gap-2"><Badge variant="destructive" className="text-xs">5</Badge> Report the incident as soon as possible</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-blue-700">If You Witness a Crime:</h3>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-2"><Badge variant="outline" className="text-xs">1</Badge> Don't intervene if it puts you at risk</li>
                <li className="flex gap-2"><Badge variant="outline" className="text-xs">2</Badge> Call police immediately (100)</li>
                <li className="flex gap-2"><Badge variant="outline" className="text-xs">3</Badge> Observe and remember details safely</li>
                <li className="flex gap-2"><Badge variant="outline" className="text-xs">4</Badge> Be willing to provide a statement</li>
                <li className="flex gap-2"><Badge variant="outline" className="text-xs">5</Badge> Follow up with authorities if needed</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg">
          <Link to="/report">
            <Camera className="h-4 w-4 mr-2" />
            Report an Incident
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/civilian">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default SafetyTips;