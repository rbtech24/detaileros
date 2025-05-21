import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import { Plus, FileText, Search, Edit, Download, Eye, Save } from "lucide-react";

// Template waiver types
const templateTypes = [
  { id: "standard", name: "Standard Service Waiver" },
  { id: "premium", name: "Premium Detail Liability Waiver" },
  { id: "special", name: "Special Treatment Waiver" },
  { id: "custom", name: "Custom Waiver" },
];

// Form schema for waiver creation/editing
const waiverFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  type: z.string(),
  version: z.string().optional(),
});

// Mock waiver data (would be replaced with actual data from the API)
const mockWaivers = [
  {
    id: 1,
    title: "Standard Service Waiver",
    type: "standard",
    version: "1.2",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-06-20"),
    isActive: true,
  },
  {
    id: 2,
    title: "Premium Detail Liability Waiver",
    type: "premium",
    version: "2.0",
    createdAt: new Date("2023-02-10"),
    updatedAt: new Date("2023-02-10"),
    isActive: true,
  },
  {
    id: 3,
    title: "Paint Correction Waiver",
    type: "special",
    version: "1.0",
    createdAt: new Date("2023-05-05"),
    updatedAt: new Date("2023-05-05"),
    isActive: true,
  },
];

// Mock waiver content
const standardWaiverContent = `
DETAILEROPS SERVICE WAIVER AND RELEASE OF LIABILITY

BY SIGNING THIS DOCUMENT, YOU ARE AGREEING TO RELEASE DETAILEROPS FROM LIABILITY FOR ANY PERSONAL INJURIES OR PROPERTY DAMAGES THAT MAY OCCUR DURING OR AS A RESULT OF OUR SERVICES.

1. WAIVER OF LIABILITY
I, the undersigned customer of DetailerOps, hereby acknowledge that I have voluntarily requested automotive detailing services. I understand that these services involve various chemicals, tools, and processes that may carry inherent risks despite all safety precautions. 

I hereby release, waive, discharge, and covenant not to sue DetailerOps, its owners, operators, employees, contractors, or agents (collectively "Releasees") from any and all liability, claims, demands, actions, and causes of action whatsoever arising out of or related to any loss, damage, or injury that may be sustained by me or my property while receiving services.

2. ASSUMPTION OF RISK
I am fully aware of the risks involved in automotive detailing services, including but not limited to:
- Pre-existing damage that may be revealed during the cleaning process
- Potential damage to aftermarket parts, modifications, or repairs
- Normal wear and tear that becomes more visible after cleaning
- Inherent risks with certain materials and their reaction to detailing processes

I voluntarily assume full responsibility for any risks of loss, property damage, or personal injury that may be sustained as a result of receiving services.

3. PREEXISTING CONDITIONS
I acknowledge that DetailerOps has advised me that they are not responsible for:
- Paint or clear coat in poor condition
- Damage from previous repairs
- Rust or corrosion revealed during cleaning
- Loose or damaged moldings, emblems, or accessories
- Mechanical or electrical components affected by water or cleaning agents
- Other pre-existing damages or defects not caused by the detailing process

4. AGREEMENT TO HOLD HARMLESS
I agree to indemnify and hold harmless the Releasees from any loss, liability, damage, or costs they may incur due to my presence in or around the service area.

5. TIME LIMITATION AND INSPECTION
I agree to inspect my vehicle upon completion of services and notify DetailerOps of any issues within 48 hours of service completion. Any claims made after this period will not be considered.

6. SEVERABILITY
I expressly agree that this release is intended to be as broad and inclusive as permitted by the laws of this state and that if any portion is held invalid, the remainder continues in full legal force and effect.

BY SIGNING BELOW, I ACKNOWLEDGE THAT I HAVE READ THIS WAIVER OF LIABILITY, FULLY UNDERSTAND ITS TERMS, UNDERSTAND THAT I HAVE GIVEN UP SUBSTANTIAL RIGHTS BY SIGNING IT, AND SIGN IT FREELY AND VOLUNTARILY WITHOUT ANY INDUCEMENT.

Customer Signature: _________________________ Date: _______________

Print Name: ________________________________ 

Vehicle Make/Model: ________________________ License Plate: ______________
`;

export default function Waivers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentWaiver, setCurrentWaiver] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // In a real app, we would fetch from API
  // const { data: waivers, isLoading } = useQuery({
  //   queryKey: ['/api/waivers'],
  //   queryFn: async () => {
  //     const res = await fetch('/api/waivers');
  //     if (!res.ok) throw new Error('Failed to fetch waivers');
  //     return res.json();
  //   }
  // });
  
  // Using mock data for now
  const waivers = mockWaivers;
  const isLoading = false;

  // Create waiver form
  const createForm = useForm<z.infer<typeof waiverFormSchema>>({
    resolver: zodResolver(waiverFormSchema),
    defaultValues: {
      title: "",
      content: "",
      type: "standard",
      version: "1.0",
    },
  });

  // Edit waiver form
  const editForm = useForm<z.infer<typeof waiverFormSchema>>({
    resolver: zodResolver(waiverFormSchema),
    defaultValues: {
      title: "",
      content: "",
      type: "standard",
      version: "",
    },
  });

  // Handle template selection
  const handleTemplateSelect = (templateType: string) => {
    if (templateType === "standard") {
      createForm.setValue("content", standardWaiverContent);
      createForm.setValue("title", "Standard Service Waiver");
      createForm.setValue("type", "standard");
    } else if (templateType === "premium") {
      // In a real app, you would have different template content for each type
      createForm.setValue("content", standardWaiverContent.replace("DETAILEROPS SERVICE WAIVER", "DETAILEROPS PREMIUM SERVICE WAIVER"));
      createForm.setValue("title", "Premium Detail Liability Waiver");
      createForm.setValue("type", "premium");
    } else if (templateType === "special") {
      createForm.setValue("content", standardWaiverContent.replace("DETAILEROPS SERVICE WAIVER", "DETAILEROPS SPECIAL TREATMENT WAIVER"));
      createForm.setValue("title", "Special Treatment Waiver");
      createForm.setValue("type", "special");
    } else {
      createForm.setValue("content", "");
      createForm.setValue("title", "Custom Waiver");
      createForm.setValue("type", "custom");
    }
  };

  // Handle creating a new waiver
  const onSubmitCreate = (data: z.infer<typeof waiverFormSchema>) => {
    // In a real app, you would call an API mutation here
    // createWaiverMutation.mutate(data);
    
    toast({
      title: "Waiver Created",
      description: `${data.title} has been created successfully.`,
    });
    
    setIsCreateDialogOpen(false);
    createForm.reset();
  };

  // Handle updating a waiver
  const onSubmitEdit = (data: z.infer<typeof waiverFormSchema>) => {
    // In a real app, you would call an API mutation here
    // updateWaiverMutation.mutate({ id: currentWaiver.id, data });
    
    toast({
      title: "Waiver Updated",
      description: `${data.title} has been updated successfully.`,
    });
    
    setIsEditDialogOpen(false);
  };

  // Open edit dialog and populate form with waiver data
  const handleEditWaiver = (waiver: any) => {
    setCurrentWaiver(waiver);
    editForm.reset({
      title: waiver.title,
      content: standardWaiverContent, // In a real app, you would fetch the content
      type: waiver.type,
      version: waiver.version,
    });
    setIsEditDialogOpen(true);
  };

  // Open view dialog to see waiver content
  const handleViewWaiver = (waiver: any) => {
    setCurrentWaiver({
      ...waiver,
      content: standardWaiverContent, // In a real app, you would fetch the content
    });
    setIsViewDialogOpen(true);
  };

  // Filter waivers based on search query and active tab
  const filteredWaivers = waivers ? waivers.filter((waiver: any) => {
    const matchesSearch = 
      waiver.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      waiver.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = 
      activeTab === "all" || 
      (activeTab === "active" && waiver.isActive) ||
      (activeTab === waiver.type);
    
    return matchesSearch && matchesTab;
  }) : [];

  // Format waiver type for display
  const formatWaiverType = (type: string) => {
    const template = templateTypes.find(t => t.id === type);
    return template ? template.name : type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Legal Waivers</h1>
        <div className="mt-3 md:mt-0 flex flex-wrap gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search waivers..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Create Waiver
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Create New Waiver</DialogTitle>
                <DialogDescription>
                  Create a new legal waiver for your detailing services.
                </DialogDescription>
              </DialogHeader>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Start from a template:</h4>
                <div className="flex flex-wrap gap-2">
                  {templateTypes.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      {template.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Standard Service Waiver" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="version"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Version</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 1.0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={createForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter the legal waiver content here..." 
                            className="min-h-[300px] font-mono text-sm"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Use clear, plain language to describe the terms of the waiver.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit">
                      Create Waiver
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Waivers</TabsTrigger>
            <TabsTrigger value="active">Active Waivers</TabsTrigger>
            <TabsTrigger value="standard">Standard</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
            <TabsTrigger value="special">Special</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            <Card>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : filteredWaivers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWaivers.map((waiver: any) => (
                        <TableRow key={waiver.id}>
                          <TableCell className="font-medium">{waiver.title}</TableCell>
                          <TableCell>{formatWaiverType(waiver.type)}</TableCell>
                          <TableCell>v{waiver.version}</TableCell>
                          <TableCell>{formatDate(waiver.updatedAt)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              waiver.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-slate-100 text-slate-800'
                            }`}>
                              {waiver.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewWaiver(waiver)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditWaiver(waiver)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  toast({
                                    title: "Waiver Downloaded",
                                    description: `${waiver.title} has been downloaded as a PDF.`,
                                  });
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-1">No waivers found</h3>
                    <p className="text-slate-500">
                      {searchQuery 
                        ? "Try a different search term or filter" 
                        : "Create your first waiver to get started"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Waiver Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Edit Waiver</DialogTitle>
            <DialogDescription>
              Update the legal waiver for your detailing services.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Version</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="min-h-[300px] font-mono text-sm"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Waiver Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{currentWaiver?.title || 'Waiver'}</DialogTitle>
            <DialogDescription>
              Version {currentWaiver?.version} • Last updated {currentWaiver ? formatDate(currentWaiver.updatedAt) : ''}
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-slate-50 p-6 rounded-md border border-slate-200 max-h-[500px] overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans text-sm">
              {currentWaiver?.content || ''}
            </pre>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              toast({
                title: "Waiver Downloaded",
                description: `${currentWaiver?.title} has been downloaded as a PDF.`,
              });
            }}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}