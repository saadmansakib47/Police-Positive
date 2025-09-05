import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Upload, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CreateComplaintData } from "@/types/complaint";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const crimeReportSchema = z
  .object({
    type: z.enum(["GD", "FIR"]),
    category: z.enum([
      "theft",
      "assault",
      "fraud",
      "domestic",
      "traffic",
      "cybercrime",
      "other",
    ]),
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters"),
    location: z.object({
      address: z.string().min(10, "Please provide a detailed address"),
    }),
    reporterInfo: z.object({
      name: z.string().optional(),
      phone: z.string().min(10, "Valid phone number required"),
      email: z.string().email().optional().or(z.literal("")),
      isAnonymous: z.boolean(),
    }),
  })
  .refine(
    (data) => {
      if (!data.reporterInfo.isAnonymous && !data.reporterInfo.name) {
        return false;
      }
      return true;
    },
    {
      message: "Name is required for non-anonymous reports",
      path: ["reporterInfo.name"],
    }
  );

type CrimeReportFormData = z.infer<typeof crimeReportSchema>;

interface CrimeReportFormProps {
  onSubmit: (data: CreateComplaintData) => Promise<void>;
  isLoading?: boolean;
}

const categoryOptions = [
  {
    value: "theft",
    label: "Theft/Burglary",
    description: "Stolen property, break-ins",
  },
  {
    value: "assault",
    label: "Assault/Violence",
    description: "Physical harm, threats",
  },
  {
    value: "fraud",
    label: "Fraud/Scam",
    description: "Financial fraud, cheating",
  },
  {
    value: "domestic",
    label: "Domestic Violence",
    description: "Family/relationship violence",
  },
  {
    value: "traffic",
    label: "Traffic Violation",
    description: "Road accidents, violations",
  },
  {
    value: "cybercrime",
    label: "Cybercrime",
    description: "Online fraud, hacking",
  },
  { value: "other", label: "Other", description: "Other criminal activities" },
];

const CrimeReportForm: React.FC<CrimeReportFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { user } = useAuth();

  const actualUser = (user as any)?.user || user;

  const form = useForm<CrimeReportFormData>({
    resolver: zodResolver(crimeReportSchema),
    defaultValues: {
      type: "GD",
      category: "other",
      title: "",
      description: "",
      location: {
        address: "",
      },
      reporterInfo: {
        name: actualUser?.firstName || "",
        phone: actualUser?.phone || "",
        email: actualUser?.email || "",
        isAnonymous: false,
      },
    },
  });

  const isAnonymous = form.watch("reporterInfo.isAnonymous");
  const selectedCategory = form.watch("category");
  const reportType = form.watch("type");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => {
      const isValidType =
        file.type.startsWith("image/") ||
        file.type.startsWith("video/") ||
        file.type.startsWith("audio/") ||
        file.type === "application/pdf";
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit

      if (!isValidType) {
        toast.error(`${file.name} is not a supported file type`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    setSelectedFiles((prev) => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // In a real app, you'd reverse geocode these coordinates
        form.setValue(
          "location.address",
          `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
        );
        setIsGettingLocation(false);
        toast.success("Location detected successfully");
      },
      (error) => {
        setIsGettingLocation(false);
        toast.error("Unable to get your location. Please enter manually.");
      }
    );
  };

  const handleSubmit = async (data: CrimeReportFormData) => {
    try {
      const complaintData = {
        ...data,
        evidence: {
          files: selectedFiles,
        },
      };

      await onSubmit({
        type: data.type,
        category: data.category,
        title: data.title,
        description: data.description,
        location: {
          address: data.location.address,
          coordinates: undefined,
        },
        reporterInfo: {
          name: data.reporterInfo.name,
          phone: data.reporterInfo.phone,
          email: data.reporterInfo.email,
          isAnonymous: data.reporterInfo.isAnonymous,
        },
        evidence: {
          files: selectedFiles,
        },
      });

      // Reset form
      form.reset();
      setSelectedFiles([]);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      {/* Report Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Report Type
          </CardTitle>
          <CardDescription>
            Choose the appropriate report type based on the severity of the
            incident
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem
                          value="GD"
                          id="GD"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="GD"
                          className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-gray-100 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <div className="space-y-1">
                            <div className="font-semibold">
                              General Diary (GD)
                            </div>
                            <div className="text-sm text-muted-foreground">
                              For non-cognizable offenses, complaints & general
                              information
                            </div>
                          </div>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="FIR"
                          id="FIR"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="FIR"
                          className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-gray-100 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <div className="space-y-1">
                            <div className="font-semibold">
                              First Information Report (FIR)
                            </div>
                            <div className="text-sm text-muted-foreground">
                              For cognizable offenses requiring immediate police
                              action
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </CardContent>
      </Card>

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle>Incident Details</CardTitle>
          <CardDescription>
            Provide detailed information about the incident
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Category Selection */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select incident category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex flex-col items-start">
                              <span>{option.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {option.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incident Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brief title describing the incident"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a clear, concise title (e.g., "Motorcycle theft
                      from parking lot")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a detailed description of what happened, when it occurred, and any other relevant information..."
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include as much detail as possible: time, date, people
                      involved, sequence of events
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="Enter the location where the incident occurred"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={getCurrentLocation}
                        disabled={isGettingLocation}
                      >
                        <MapPin
                          className={`h-4 w-4 ${
                            isGettingLocation ? "animate-pulse" : ""
                          }`}
                        />
                      </Button>
                    </div>
                    <FormDescription>
                      Provide the exact address or location details. Click the
                      map icon to use your current location.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reporter Information */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold">Reporter Information</h3>

                <FormField
                  control={form.control}
                  name="reporterInfo.isAnonymous"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Submit anonymously</FormLabel>
                        <FormDescription>
                          Your identity will be kept confidential
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {!isAnonymous && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="reporterInfo.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your full name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reporterInfo.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="reporterInfo.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your phone number"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Required for follow-up communication
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Evidence Upload */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="evidence">Evidence (Optional)</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload photos, videos, audio recordings, or documents
                    related to the incident
                  </p>
                </div>

                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <div className="mt-4">
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Click to upload files
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          PNG, JPG, MP4, MP3, PDF up to 10MB each (max 5 files)
                        </span>
                      </Label>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept="image/*,video/*,audio/*,.pdf"
                        onChange={handleFileSelect}
                        className="sr-only"
                      />
                    </div>
                  </div>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Files:</Label>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {file.type.split("/")[0]}
                            </Badge>
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Submitting..." : `Submit ${reportType}`}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setSelectedFiles([]);
                  }}
                >
                  Clear Form
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrimeReportForm;
