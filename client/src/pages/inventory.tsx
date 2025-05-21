import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  formatCurrency,
  formatDate
} from "@/lib/utils";
import { 
  Plus, 
  Search, 
  Edit,
  Trash2,
  AlertCircle,
  Box,
  Package,
  Droplet,
  Spray,
  Truck,
  ShoppingCart,
  BarChart3,
  History,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  RefreshCw
} from "lucide-react";

// Product types and categories
const productCategories = [
  { id: "cleaning", name: "Cleaning Products" },
  { id: "polishing", name: "Polishing & Compounds" },
  { id: "waxes", name: "Waxes & Sealants" },
  { id: "coatings", name: "Ceramic Coatings" },
  { id: "tools", name: "Tools & Equipment" },
  { id: "accessories", name: "Accessories" },
  { id: "merchandise", name: "Merchandise" },
  { id: "other", name: "Other" }
];

// Product form schema
const productFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  sku: z.string().min(2, "SKU must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  unitPrice: z.string().min(1, "Unit price is required"),
  costPrice: z.string().min(1, "Cost price is required"),
  quantityInStock: z.string().min(1, "Quantity is required"),
  minStockLevel: z.string().min(1, "Minimum stock level is required"),
  supplier: z.string().optional(),
  location: z.string().optional(),
  isActive: z.boolean().default(true),
  imageUrl: z.string().optional(),
});

// Transaction form schema
const transactionFormSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.string().min(1, "Quantity is required"),
  type: z.enum(["in", "out"]),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
  date: z.date(),
});

// Mock products data
const mockProducts = [
  {
    id: 1,
    name: "Premium Car Shampoo",
    sku: "CS-001",
    category: "cleaning",
    description: "High-quality pH-neutral car shampoo with wax enhancers",
    unitPrice: 19.99,
    costPrice: 9.50,
    quantityInStock: 45,
    minStockLevel: 10,
    supplier: "Auto Care Supplies",
    location: "Shelf A1",
    isActive: true,
    lastRestocked: new Date("2025-04-15"),
    imageUrl: ""
  },
  {
    id: 2,
    name: "Ceramic Coating Pro",
    sku: "CC-100",
    category: "coatings",
    description: "Professional-grade ceramic coating with 5-year durability",
    unitPrice: 149.99,
    costPrice: 75.00,
    quantityInStock: 12,
    minStockLevel: 5,
    supplier: "Ceramic Tech",
    location: "Cabinet B3",
    isActive: true,
    lastRestocked: new Date("2025-05-01"),
    imageUrl: ""
  },
  {
    id: 3,
    name: "Microfiber Towels (Pack of 10)",
    sku: "MT-010",
    category: "accessories",
    description: "Ultra-soft microfiber towels for scratch-free drying and polishing",
    unitPrice: 24.99,
    costPrice: 12.50,
    quantityInStock: 30,
    minStockLevel: 15,
    supplier: "Detail Supply Co",
    location: "Shelf C2",
    isActive: true,
    lastRestocked: new Date("2025-04-20"),
    imageUrl: ""
  },
  {
    id: 4,
    name: "Dual Action Polisher",
    sku: "DA-002",
    category: "tools",
    description: "Professional-grade dual action polisher with variable speed control",
    unitPrice: 249.99,
    costPrice: 150.00,
    quantityInStock: 8,
    minStockLevel: 3,
    supplier: "Pro Tools Inc",
    location: "Cabinet D1",
    isActive: true,
    lastRestocked: new Date("2025-03-10"),
    imageUrl: ""
  },
  {
    id: 5,
    name: "Tire Shine Gel",
    sku: "TS-025",
    category: "cleaning",
    description: "Long-lasting tire shine gel with UV protection",
    unitPrice: 14.99,
    costPrice: 7.25,
    quantityInStock: 38,
    minStockLevel: 12,
    supplier: "Auto Care Supplies",
    location: "Shelf A2",
    isActive: true,
    lastRestocked: new Date("2025-04-28"),
    imageUrl: ""
  },
  {
    id: 6,
    name: "Clay Bar Kit",
    sku: "CB-015",
    category: "polishing",
    description: "Complete clay bar kit for removing surface contaminants",
    unitPrice: 29.99,
    costPrice: 15.00,
    quantityInStock: 22,
    minStockLevel: 8,
    supplier: "Detail Supply Co",
    location: "Shelf B4",
    isActive: true,
    lastRestocked: new Date("2025-04-05"),
    imageUrl: ""
  },
  {
    id: 7,
    name: "Detailing Brushes Set",
    sku: "DB-030",
    category: "tools",
    description: "Set of 5 different detailing brushes for interior and exterior use",
    unitPrice: 34.99,
    costPrice: 18.50,
    quantityInStock: 15,
    minStockLevel: 5,
    supplier: "Pro Tools Inc",
    location: "Shelf C3",
    isActive: true,
    lastRestocked: new Date("2025-04-12"),
    imageUrl: ""
  },
  {
    id: 8,
    name: "Carnauba Wax",
    sku: "CW-050",
    category: "waxes",
    description: "Premium carnauba wax for deep shine and protection",
    unitPrice: 39.99,
    costPrice: 20.00,
    quantityInStock: 18,
    minStockLevel: 6,
    supplier: "Auto Care Supplies",
    location: "Shelf B1",
    isActive: true,
    lastRestocked: new Date("2025-05-05"),
    imageUrl: ""
  },
  {
    id: 9,
    name: "DetailerOps T-Shirt",
    sku: "TS-001",
    category: "merchandise",
    description: "High-quality DetailerOps branded t-shirt (Medium)",
    unitPrice: 24.99,
    costPrice: 10.00,
    quantityInStock: 25,
    minStockLevel: 10,
    supplier: "Custom Apparel",
    location: "Merch Corner",
    isActive: true,
    lastRestocked: new Date("2025-03-20"),
    imageUrl: ""
  }
];

// Mock transactions data
const mockTransactions = [
  {
    id: 1,
    productId: 1,
    productName: "Premium Car Shampoo",
    quantity: 10,
    type: "in",
    reason: "Restock",
    notes: "Regular monthly restock",
    date: new Date("2025-04-15")
  },
  {
    id: 2,
    productId: 2,
    productName: "Ceramic Coating Pro",
    quantity: 5,
    type: "in",
    reason: "Restock",
    notes: "New shipment arrival",
    date: new Date("2025-05-01")
  },
  {
    id: 3,
    productId: 1,
    productName: "Premium Car Shampoo",
    quantity: 2,
    type: "out",
    reason: "Job Usage",
    notes: "Used for premium detailing package",
    date: new Date("2025-05-03")
  },
  {
    id: 4,
    productId: 3,
    productName: "Microfiber Towels (Pack of 10)",
    quantity: 3,
    type: "out",
    reason: "Job Usage",
    notes: "Used for vehicle detailing",
    date: new Date("2025-05-04")
  },
  {
    id: 5,
    productId: 5,
    productName: "Tire Shine Gel",
    quantity: 1,
    type: "out",
    reason: "Damaged",
    notes: "Container damaged during handling",
    date: new Date("2025-05-05")
  },
  {
    id: 6,
    productId: 8,
    productName: "Carnauba Wax",
    quantity: 5,
    type: "in",
    reason: "Restock",
    notes: "New arrival, special promotion pricing",
    date: new Date("2025-05-05")
  },
  {
    id: 7,
    productId: 4,
    productName: "Dual Action Polisher",
    quantity: 1,
    type: "out",
    reason: "Internal Use",
    notes: "Used for staff training",
    date: new Date("2025-05-06")
  }
];

// Mock suppliers data
const mockSuppliers = [
  { id: 1, name: "Auto Care Supplies", contact: "John Smith", email: "john@autocare.com", phone: "(555) 123-4567" },
  { id: 2, name: "Ceramic Tech", contact: "Maria Garcia", email: "maria@ceramictech.com", phone: "(555) 234-5678" },
  { id: 3, name: "Detail Supply Co", contact: "David Johnson", email: "david@detailsupply.com", phone: "(555) 345-6789" },
  { id: 4, name: "Pro Tools Inc", contact: "Sarah Williams", email: "sarah@protools.com", phone: "(555) 456-7890" },
  { id: 5, name: "Custom Apparel", contact: "Robert Brown", email: "robert@customapparel.com", phone: "(555) 567-8901" }
];

export default function Inventory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("products");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");
  
  // Create product form
  const productForm = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      description: "",
      unitPrice: "",
      costPrice: "",
      quantityInStock: "",
      minStockLevel: "",
      supplier: "",
      location: "",
      isActive: true,
      imageUrl: ""
    },
  });
  
  // Transaction form
  const transactionForm = useForm<z.infer<typeof transactionFormSchema>>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      productId: "",
      quantity: "",
      type: "in",
      reason: "",
      notes: "",
      date: new Date()
    },
  });

  // In a real app, we would fetch from API
  // const { data: products, isLoading: isLoadingProducts } = useQuery({
  //   queryKey: ['/api/inventory/products'],
  //   queryFn: async () => {
  //     const res = await fetch('/api/inventory/products');
  //     if (!res.ok) throw new Error('Failed to fetch products');
  //     return res.json();
  //   }
  // });
  
  // Using mock data for now
  const products = mockProducts;
  const isLoadingProducts = false;
  
  // In a real app, we would fetch from API
  // const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
  //   queryKey: ['/api/inventory/transactions'],
  //   queryFn: async () => {
  //     const res = await fetch('/api/inventory/transactions');
  //     if (!res.ok) throw new Error('Failed to fetch transactions');
  //     return res.json();
  //   }
  // });
  
  // Using mock data for now
  const transactions = mockTransactions;
  const isLoadingTransactions = false;
  
  // Calculate low stock products
  const lowStockProducts = products ? products.filter(product => 
    product.quantityInStock <= product.minStockLevel && product.quantityInStock > 0
  ) : [];
  
  // Calculate out of stock products
  const outOfStockProducts = products ? products.filter(product => 
    product.quantityInStock === 0
  ) : [];
  
  // Calculate inventory value
  const inventoryValue = products ? products.reduce((total, product) => 
    total + (product.costPrice * product.quantityInStock), 0
  ) : 0;
  
  // Calculate retail value
  const retailValue = products ? products.reduce((total, product) => 
    total + (product.unitPrice * product.quantityInStock), 0
  ) : 0;
  
  // Handle new product submission
  const handleCreateProduct = (data: z.infer<typeof productFormSchema>) => {
    // In a real app, you would call an API mutation here
    // createProductMutation.mutate(data);
    
    toast({
      title: "Product Created",
      description: `${data.name} has been added to your inventory.`,
    });
    
    setIsProductDialogOpen(false);
    productForm.reset();
  };
  
  // Handle edit product submission
  const handleUpdateProduct = (data: z.infer<typeof productFormSchema>) => {
    if (!currentProduct) return;
    
    // In a real app, you would call an API mutation here
    // updateProductMutation.mutate({ id: currentProduct.id, ...data });
    
    toast({
      title: "Product Updated",
      description: `${data.name} has been updated successfully.`,
    });
    
    setIsProductDialogOpen(false);
  };
  
  // Handle delete product confirmation
  const handleDeleteProduct = () => {
    if (!currentProduct) return;
    
    // In a real app, you would call an API mutation here
    // deleteProductMutation.mutate(currentProduct.id);
    
    toast({
      title: "Product Deleted",
      description: `${currentProduct.name} has been deleted from inventory.`,
    });
    
    setIsDeleteDialogOpen(false);
    setCurrentProduct(null);
  };
  
  // Handle inventory transaction submission
  const handleCreateTransaction = (data: z.infer<typeof transactionFormSchema>) => {
    // In a real app, you would call an API mutation here
    // createTransactionMutation.mutate(data);
    
    const productName = products.find(p => p.id.toString() === data.productId)?.name || "Product";
    
    toast({
      title: "Transaction Recorded",
      description: `${data.type === 'in' ? 'Added' : 'Removed'} ${data.quantity} units of ${productName}.`,
    });
    
    setIsTransactionDialogOpen(false);
    transactionForm.reset({
      productId: "",
      quantity: "",
      type: "in",
      reason: "",
      notes: "",
      date: new Date()
    });
  };
  
  // Open edit dialog and populate form with product data
  const handleEditProduct = (product: any) => {
    setCurrentProduct(product);
    productForm.reset({
      name: product.name,
      sku: product.sku,
      category: product.category,
      description: product.description || "",
      unitPrice: product.unitPrice.toString(),
      costPrice: product.costPrice.toString(),
      quantityInStock: product.quantityInStock.toString(),
      minStockLevel: product.minStockLevel.toString(),
      supplier: product.supplier || "",
      location: product.location || "",
      isActive: product.isActive,
      imageUrl: product.imageUrl || ""
    });
    setIsProductDialogOpen(true);
  };
  
  // Open delete confirmation dialog
  const handleConfirmDelete = (product: any) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };
  
  // Open transaction dialog for a specific product
  const handleAddTransaction = (product: any) => {
    transactionForm.reset({
      productId: product.id.toString(),
      quantity: "1",
      type: "in",
      reason: "Restock",
      notes: "",
      date: new Date()
    });
    setIsTransactionDialogOpen(true);
  };
  
  // Handle sort click
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  
  // Filter and sort products
  const getFilteredAndSortedProducts = () => {
    if (!products) return [];
    
    let filtered = [...products];
    
    // Apply category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(product => product.category === filterCategory);
    }
    
    // Apply stock level filter
    if (stockFilter === "low") {
      filtered = filtered.filter(product => 
        product.quantityInStock <= product.minStockLevel && product.quantityInStock > 0
      );
    } else if (stockFilter === "out") {
      filtered = filtered.filter(product => product.quantityInStock === 0);
    }
    
    // Apply search filter
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search) ||
        product.description?.toLowerCase().includes(search) ||
        product.supplier?.toLowerCase().includes(search)
      );
    }
    
    // Apply sorting
    if (sortColumn) {
      filtered.sort((a, b) => {
        let aValue = a[sortColumn as keyof typeof a];
        let bValue = b[sortColumn as keyof typeof b];
        
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        
        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  };

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = productCategories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };
  
  // Helper function to get stock status style
  const getStockStatusStyle = (quantity: number, minLevel: number) => {
    if (quantity === 0) {
      return {
        label: "Out of Stock",
        className: "bg-red-100 text-red-800"
      };
    } 
    if (quantity <= minLevel) {
      return {
        label: "Low Stock",
        className: "bg-amber-100 text-amber-800"
      };
    }
    return {
      label: "In Stock",
      className: "bg-green-100 text-green-800"
    };
  };

  const filteredProducts = getFilteredAndSortedProducts();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <div className="mt-3 md:mt-0 flex flex-wrap gap-2">
          <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{currentProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                <DialogDescription>
                  {currentProduct 
                    ? "Update the product information in your inventory." 
                    : "Add a new product to your inventory tracking system."}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...productForm}>
                <form onSubmit={productForm.handleSubmit(currentProduct ? handleUpdateProduct : handleCreateProduct)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={productForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Premium Car Shampoo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={productForm.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., CS-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={productForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {productCategories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={productForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter product description..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={productForm.control}
                      name="unitPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Price ($)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={productForm.control}
                      name="costPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cost Price ($)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={productForm.control}
                      name="quantityInStock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity in Stock</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={productForm.control}
                      name="minStockLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Stock Level</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={productForm.control}
                      name="supplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supplier</FormLabel>
                          <Select value={field.value || ""} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select supplier" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">None</SelectItem>
                              {mockSuppliers.map((supplier) => (
                                <SelectItem key={supplier.id} value={supplier.name}>
                                  {supplier.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={productForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Storage Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Shelf A1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={productForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Active Product</FormLabel>
                          <FormDescription>
                            Inactive products won't appear in ordering systems
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value} 
                            onCheckedChange={field.onChange} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit">
                      {currentProduct ? 'Update Product' : 'Add Product'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Record Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Record Inventory Transaction</DialogTitle>
                <DialogDescription>
                  Add or remove products from your inventory.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...transactionForm}>
                <form onSubmit={transactionForm.handleSubmit(handleCreateTransaction)} className="space-y-4">
                  <FormField
                    control={transactionForm.control}
                    name="productId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={transactionForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transaction Type</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="in">Stock In</SelectItem>
                              <SelectItem value="out">Stock Out</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={transactionForm.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={transactionForm.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {field.value === "in" ? (
                              <>
                                <SelectItem value="Restock">Restock</SelectItem>
                                <SelectItem value="Return">Return</SelectItem>
                                <SelectItem value="Adjustment">Inventory Adjustment</SelectItem>
                                <SelectItem value="Initial">Initial Stock</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="Job Usage">Job Usage</SelectItem>
                                <SelectItem value="Damaged">Damaged/Expired</SelectItem>
                                <SelectItem value="Internal Use">Internal Use</SelectItem>
                                <SelectItem value="Sale">Direct Sale</SelectItem>
                                <SelectItem value="Adjustment">Inventory Adjustment</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={transactionForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={transactionForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional notes about this transaction..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit">
                      Record Transaction
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Box className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">{products?.length || 0}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
              <span className="text-2xl font-bold">{lowStockProducts.length}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Package className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">{formatCurrency(inventoryValue)}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Retail Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ShoppingCart className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">{formatCurrency(retailValue)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-auto grid-cols-2 mb-4">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="w-full sm:w-[300px]">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {productCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={stockFilter} onValueChange={(value) => setStockFilter(value as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Stock Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock Levels</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-x-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                setSearchQuery("");
                setFilterCategory("all");
                setStockFilter("all");
                setSortColumn("name");
                setSortDirection("asc");
              }}>
                Clear Filters
              </Button>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">
                    <button 
                      className="flex items-center"
                      onClick={() => handleSort("name")}
                    >
                      Product
                      {sortColumn === "name" && (
                        sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center"
                      onClick={() => handleSort("quantityInStock")}
                    >
                      Stock
                      {sortColumn === "quantityInStock" && (
                        sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center"
                      onClick={() => handleSort("unitPrice")}
                    >
                      Price
                      {sortColumn === "unitPrice" && (
                        sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingProducts ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const stockStatus = getStockStatusStyle(product.quantityInStock, product.minStockLevel);
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <span>SKU: {product.sku}</span>
                                {product.supplier && (
                                  <span>• {product.supplier}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getCategoryName(product.category)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{product.quantityInStock}</span>
                            <Badge variant="outline" className={`${stockStatus.className} mt-1 w-fit`}>
                              {stockStatus.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(product.unitPrice)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleAddTransaction(product)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleConfirmDelete(product)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No products found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="w-full sm:w-[300px]">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-x-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingTransactions ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : transactions.length > 0 ? (
                  [...transactions]
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>{transaction.productName}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={transaction.type === "in" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                            }
                          >
                            {transaction.type === "in" ? "IN" : "OUT"}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.quantity}</TableCell>
                        <TableCell>{transaction.reason}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{transaction.notes}</TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No transaction history found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {currentProduct && (
            <div className="py-4">
              <p className="font-medium">{currentProduct.name}</p>
              <p className="text-sm text-muted-foreground">SKU: {currentProduct.sku}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}