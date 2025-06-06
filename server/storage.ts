import { 
  users, type User, type InsertUser,
  customers, type Customer, type InsertCustomer,
  vehicles, type Vehicle, type InsertVehicle,
  services, type Service, type InsertService,
  jobs, type Job, type InsertJob,
  jobServices, type JobService, type InsertJobService,
  invoices, type Invoice, type InsertInvoice,
  payments, type Payment, type InsertPayment,
  activities, type Activity, type InsertActivity,
  reviews, type Review, type InsertReview,
  membershipPlans, type MembershipPlan, type InsertMembershipPlan,
  customerSubscriptions, type CustomerSubscription, type InsertCustomerSubscription,
  inventoryItems, type InventoryItem, type InsertInventoryItem,
  inventoryTransactions, type InventoryTransaction, type InsertInventoryTransaction
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  listUsers(): Promise<User[]>;
  
  // Customer methods
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<Customer>): Promise<Customer | undefined>;
  listCustomers(page?: number, pageSize?: number, search?: string): Promise<{ customers: Customer[], total: number }>;
  deleteCustomer(id: number): Promise<boolean>;
  
  // Vehicle methods
  getVehicle(id: number): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<Vehicle>): Promise<Vehicle | undefined>;
  listVehiclesByCustomer(customerId: number): Promise<Vehicle[]>;
  deleteVehicle(id: number): Promise<boolean>;
  
  // Service methods
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<Service>): Promise<Service | undefined>;
  listServices(): Promise<Service[]>;
  deleteService(id: number): Promise<boolean>;
  
  // Job methods
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, job: Partial<Job>): Promise<Job | undefined>;
  listJobs(filters?: { status?: string, technicianId?: number, customerId?: number, startDate?: Date, endDate?: Date }): Promise<Job[]>;
  deleteJob(id: number): Promise<boolean>;
  
  // JobService methods
  getJobService(id: number): Promise<JobService | undefined>;
  createJobService(jobService: InsertJobService): Promise<JobService>;
  updateJobService(id: number, jobService: Partial<JobService>): Promise<JobService | undefined>;
  listJobServicesByJob(jobId: number): Promise<JobService[]>;
  deleteJobService(id: number): Promise<boolean>;
  
  // Invoice methods
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<Invoice>): Promise<Invoice | undefined>;
  listInvoices(filters?: { customerId?: number, paid?: boolean }): Promise<Invoice[]>;
  deleteInvoice(id: number): Promise<boolean>;
  
  // Payment methods
  getPayment(id: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  listPaymentsByInvoice(invoiceId: number): Promise<Payment[]>;
  
  // Activity methods
  createActivity(activity: InsertActivity): Promise<Activity>;
  listActivitiesByCustomer(customerId: number, limit?: number): Promise<Activity[]>;
  listRecentActivities(limit?: number): Promise<Activity[]>;
  
  // Review methods
  getReview(id: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, review: Partial<Review>): Promise<Review | undefined>;
  listReviews(limit?: number): Promise<Review[]>;
  
  // Dashboard/reporting methods
  getRevenueStats(startDate: Date, endDate: Date): Promise<{
    totalRevenue: number;
    jobsCompleted: number;
    newCustomers: number;
    avgJobValue: number;
  }>;
  
  getTopServices(startDate: Date, endDate: Date, limit?: number): Promise<{
    serviceId: number;
    serviceName: string;
    revenue: number;
    count: number;
  }[]>;
  
  // Membership Plan methods
  getMembershipPlan(id: number): Promise<MembershipPlan | undefined>;
  createMembershipPlan(plan: InsertMembershipPlan): Promise<MembershipPlan>;
  updateMembershipPlan(id: number, plan: Partial<MembershipPlan>): Promise<MembershipPlan | undefined>;
  listMembershipPlans(activeOnly?: boolean): Promise<MembershipPlan[]>;
  deleteMembershipPlan(id: number): Promise<boolean>;
  
  // Customer Subscription methods
  getCustomerSubscription(id: number): Promise<CustomerSubscription | undefined>;
  getActiveSubscriptionByCustomerId(customerId: number): Promise<CustomerSubscription | undefined>;
  createCustomerSubscription(subscription: InsertCustomerSubscription): Promise<CustomerSubscription>;
  updateCustomerSubscription(id: number, subscription: Partial<CustomerSubscription>): Promise<CustomerSubscription | undefined>;
  listCustomerSubscriptions(filters?: { customerId?: number, planId?: number, status?: string }): Promise<CustomerSubscription[]>;
  cancelSubscription(id: number): Promise<CustomerSubscription | undefined>;
  
  // Stripe-related methods for subscriptions
  updateStripeCustomerId(customerId: number, stripeCustomerId: string): Promise<Customer>;
  updateSubscriptionStripeInfo(subscriptionId: number, stripeInfo: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<CustomerSubscription | undefined>;
  
  // Inventory Item methods
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, item: Partial<InventoryItem>): Promise<InventoryItem | undefined>;
  listInventoryItems(filters?: { category?: string, search?: string, lowStock?: boolean }): Promise<InventoryItem[]>;
  deleteInventoryItem(id: number): Promise<boolean>;
  
  // Inventory Transaction methods
  getInventoryTransaction(id: number): Promise<InventoryTransaction | undefined>;
  createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction>;
  listInventoryTransactions(filters?: { inventoryItemId?: number, userId?: number, type?: string, startDate?: Date, endDate?: Date }): Promise<InventoryTransaction[]>;
  getInventoryItemsByTechnician(technicianId: number): Promise<{ item: InventoryItem, quantity: number }[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private customers: Map<number, Customer>;
  private vehicles: Map<number, Vehicle>;
  private services: Map<number, Service>;
  private jobs: Map<number, Job>;
  private jobServices: Map<number, JobService>;
  private invoices: Map<number, Invoice>;
  private payments: Map<number, Payment>;
  private activities: Map<number, Activity>;
  private reviews: Map<number, Review>;
  private membershipPlans: Map<number, MembershipPlan>;
  private customerSubscriptions: Map<number, CustomerSubscription>;
  private inventoryItems: Map<number, InventoryItem>;
  private inventoryTransactions: Map<number, InventoryTransaction>;
  
  // Membership Plan methods
  async getMembershipPlan(id: number): Promise<MembershipPlan | undefined> {
    return this.membershipPlans.get(id);
  }
  
  async createMembershipPlan(plan: InsertMembershipPlan): Promise<MembershipPlan> {
    const id = this.membershipPlanIdCounter++;
    const now = new Date();
    
    const newPlan: MembershipPlan = {
      ...plan,
      id,
      features: plan.features || [],
      active: plan.active !== undefined ? plan.active : true,
      createdAt: now,
      updatedAt: now
    };
    
    this.membershipPlans.set(id, newPlan);
    return newPlan;
  }
  
  async updateMembershipPlan(id: number, plan: Partial<MembershipPlan>): Promise<MembershipPlan | undefined> {
    const existingPlan = this.membershipPlans.get(id);
    if (!existingPlan) return undefined;
    
    const updatedPlan: MembershipPlan = {
      ...existingPlan,
      ...plan,
      updatedAt: new Date()
    };
    
    this.membershipPlans.set(id, updatedPlan);
    return updatedPlan;
  }
  
  async listMembershipPlans(activeOnly: boolean = false): Promise<MembershipPlan[]> {
    const plans = Array.from(this.membershipPlans.values());
    return activeOnly ? plans.filter(plan => plan.active) : plans;
  }
  
  async deleteMembershipPlan(id: number): Promise<boolean> {
    // Check if there are any active subscriptions using this plan
    const activeSubscriptions = Array.from(this.customerSubscriptions.values())
      .filter(sub => sub.planId === id && sub.status === 'active');
    
    if (activeSubscriptions.length > 0) {
      return false; // Cannot delete a plan with active subscriptions
    }
    
    return this.membershipPlans.delete(id);
  }
  
  // Customer Subscription methods
  async getCustomerSubscription(id: number): Promise<CustomerSubscription | undefined> {
    return this.customerSubscriptions.get(id);
  }
  
  async getActiveSubscriptionByCustomerId(customerId: number): Promise<CustomerSubscription | undefined> {
    return Array.from(this.customerSubscriptions.values()).find(
      sub => sub.customerId === customerId && sub.status === 'active'
    );
  }
  
  async createCustomerSubscription(subscription: InsertCustomerSubscription): Promise<CustomerSubscription> {
    const id = this.customerSubscriptionIdCounter++;
    const now = new Date();
    
    // Check if customer exists
    const customer = this.customers.get(subscription.customerId);
    if (!customer) {
      throw new Error(`Customer with ID ${subscription.customerId} not found`);
    }
    
    // Check if plan exists
    const plan = this.membershipPlans.get(subscription.planId);
    if (!plan) {
      throw new Error(`Membership plan with ID ${subscription.planId} not found`);
    }
    
    // Cancel any existing active subscriptions for this customer
    const existingSubscription = await this.getActiveSubscriptionByCustomerId(subscription.customerId);
    if (existingSubscription) {
      await this.cancelSubscription(existingSubscription.id);
    }
    
    const newSubscription: CustomerSubscription = {
      ...subscription,
      id,
      status: subscription.status || 'active',
      billingCycle: subscription.billingCycle || 'monthly',
      canceledAt: null,
      createdAt: now,
      updatedAt: now
    };
    
    this.customerSubscriptions.set(id, newSubscription);
    
    // Create activity record for the new subscription
    await this.createActivity({
      type: 'subscription_created',
      customerId: subscription.customerId,
      description: `Customer subscribed to ${plan.name} plan`,
      metadata: { 
        planId: plan.id, 
        planName: plan.name,
        billingCycle: newSubscription.billingCycle,
        price: newSubscription.billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice
      }
    });
    
    return newSubscription;
  }
  
  async updateCustomerSubscription(id: number, subscription: Partial<CustomerSubscription>): Promise<CustomerSubscription | undefined> {
    const existingSubscription = this.customerSubscriptions.get(id);
    if (!existingSubscription) return undefined;
    
    const updatedSubscription: CustomerSubscription = {
      ...existingSubscription,
      ...subscription,
      updatedAt: new Date()
    };
    
    this.customerSubscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }
  
  async listCustomerSubscriptions(filters?: { customerId?: number, planId?: number, status?: string }): Promise<CustomerSubscription[]> {
    let subscriptions = Array.from(this.customerSubscriptions.values());
    
    if (filters) {
      if (filters.customerId !== undefined) {
        subscriptions = subscriptions.filter(sub => sub.customerId === filters.customerId);
      }
      
      if (filters.planId !== undefined) {
        subscriptions = subscriptions.filter(sub => sub.planId === filters.planId);
      }
      
      if (filters.status !== undefined) {
        subscriptions = subscriptions.filter(sub => sub.status === filters.status);
      }
    }
    
    return subscriptions;
  }
  
  async cancelSubscription(id: number): Promise<CustomerSubscription | undefined> {
    const subscription = this.customerSubscriptions.get(id);
    if (!subscription || subscription.status === 'canceled') return undefined;
    
    const now = new Date();
    const updatedSubscription: CustomerSubscription = {
      ...subscription,
      status: 'canceled',
      canceledAt: now,
      updatedAt: now
    };
    
    this.customerSubscriptions.set(id, updatedSubscription);
    
    // Create activity record for the canceled subscription
    const plan = this.membershipPlans.get(subscription.planId);
    if (plan) {
      await this.createActivity({
        type: 'subscription_canceled',
        customerId: subscription.customerId,
        description: `Subscription to ${plan.name} plan was canceled`,
        metadata: { 
          planId: plan.id, 
          planName: plan.name,
          subscriptionId: subscription.id
        }
      });
    }
    
    return updatedSubscription;
  }
  
  // Stripe-related methods for subscriptions
  async updateStripeCustomerId(customerId: number, stripeCustomerId: string): Promise<Customer> {
    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error(`Customer with ID ${customerId} not found`);
    }
    
    // In a real implementation, we would update the customer record with the Stripe ID
    // For now, we'll just simulate this in memory
    
    // Create an activity to track this change
    await this.createActivity({
      type: 'stripe_customer_created',
      customerId,
      description: `Stripe customer ID created for ${customer.fullName}`,
      metadata: { stripeCustomerId }
    });
    
    // Return the customer (in a real implementation, we would return the updated customer)
    return customer;
  }
  
  async updateSubscriptionStripeInfo(
    subscriptionId: number, 
    stripeInfo: { stripeCustomerId: string; stripeSubscriptionId: string }
  ): Promise<CustomerSubscription | undefined> {
    return this.updateCustomerSubscription(subscriptionId, {
      stripeCustomerId: stripeInfo.stripeCustomerId,
      stripeSubscriptionId: stripeInfo.stripeSubscriptionId
    });
  }
  
  // ===========================================
  // Inventory Item methods
  // ===========================================
  
  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }
  
  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const id = this.inventoryItemIdCounter++;
    const now = new Date();
    
    const newItem: InventoryItem = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
      isActive: item.isActive !== undefined ? item.isActive : true,
      quantityInStock: item.quantityInStock || 0,
      minStockLevel: item.minStockLevel || 0
    };
    
    this.inventoryItems.set(id, newItem);
    
    // Create activity for inventory item creation
    await this.createActivity({
      type: 'inventory_item_added',
      description: `Added new inventory item: ${item.name}`,
      metadata: { 
        itemId: id,
        itemName: item.name,
        category: item.category
      }
    });
    
    return newItem;
  }
  
  async updateInventoryItem(id: number, item: Partial<InventoryItem>): Promise<InventoryItem | undefined> {
    const existingItem = this.inventoryItems.get(id);
    if (!existingItem) return undefined;
    
    const updatedItem: InventoryItem = {
      ...existingItem,
      ...item,
      updatedAt: new Date()
    };
    
    this.inventoryItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async listInventoryItems(filters?: { category?: string, search?: string, lowStock?: boolean }): Promise<InventoryItem[]> {
    let items = Array.from(this.inventoryItems.values());
    
    if (filters) {
      if (filters.category) {
        items = items.filter(item => item.category === filters.category);
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        items = items.filter(item => 
          item.name.toLowerCase().includes(searchLower) || 
          item.sku.toLowerCase().includes(searchLower) ||
          (item.description && item.description.toLowerCase().includes(searchLower))
        );
      }
      
      if (filters.lowStock) {
        items = items.filter(item => item.quantityInStock <= item.minStockLevel);
      }
    }
    
    return items;
  }
  
  async deleteInventoryItem(id: number): Promise<boolean> {
    const item = this.inventoryItems.get(id);
    if (!item) return false;
    
    // Check if there are any transactions for this item
    const hasTransactions = Array.from(this.inventoryTransactions.values())
      .some(transaction => transaction.inventoryItemId === id);
    
    if (hasTransactions) {
      // Instead of deleting, mark as inactive
      await this.updateInventoryItem(id, { isActive: false });
      return true;
    }
    
    return this.inventoryItems.delete(id);
  }
  
  // ===========================================
  // Inventory Transaction methods
  // ===========================================
  
  async getInventoryTransaction(id: number): Promise<InventoryTransaction | undefined> {
    return this.inventoryTransactions.get(id);
  }
  
  async createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
    const id = this.inventoryTransactionIdCounter++;
    const now = new Date();
    
    // Get the inventory item
    const item = this.inventoryItems.get(transaction.inventoryItemId);
    if (!item) {
      throw new Error(`Inventory item with ID ${transaction.inventoryItemId} not found`);
    }
    
    // Calculate new stock quantity
    let newQuantity = item.quantityInStock;
    if (transaction.type === 'in') {
      newQuantity += transaction.quantity;
    } else if (transaction.type === 'out') {
      newQuantity -= transaction.quantity;
      
      // Check if there's enough stock
      if (newQuantity < 0) {
        throw new Error(`Not enough stock for item ${item.name}. Requested: ${transaction.quantity}, Available: ${item.quantityInStock}`);
      }
    } else if (transaction.type === 'return') {
      newQuantity += transaction.quantity;
    } else if (transaction.type === 'adjustment') {
      // For adjustment, the quantity is the absolute value
      newQuantity = transaction.quantity;
    }
    
    // Update the item's stock quantity
    await this.updateInventoryItem(item.id, { quantityInStock: newQuantity });
    
    // Get technician name if applicable
    let technicianName = '';
    if (transaction.userId) {
      const user = this.users.get(transaction.userId);
      if (user) {
        technicianName = user.fullName;
      }
    }
    
    // Create the transaction record
    const newTransaction: InventoryTransaction = {
      ...transaction,
      id,
      createdAt: now,
      date: transaction.date || now
    };
    
    this.inventoryTransactions.set(id, newTransaction);
    
    // Create activity for this transaction
    let activityDescription = '';
    if (transaction.type === 'out' && technicianName) {
      activityDescription = `${technicianName} checked out ${transaction.quantity} ${item.name}`;
    } else if (transaction.type === 'in') {
      activityDescription = `Added ${transaction.quantity} ${item.name} to inventory`;
    } else if (transaction.type === 'return' && technicianName) {
      activityDescription = `${technicianName} returned ${transaction.quantity} ${item.name}`;
    } else if (transaction.type === 'adjustment') {
      activityDescription = `Adjusted ${item.name} inventory to ${transaction.quantity}`;
    }
    
    await this.createActivity({
      type: 'inventory_transaction',
      description: activityDescription,
      jobId: transaction.jobId || null,
      metadata: { 
        transactionId: id,
        itemId: item.id,
        itemName: item.name,
        type: transaction.type,
        quantity: transaction.quantity,
        technician: technicianName || null
      }
    });
    
    return newTransaction;
  }
  
  async listInventoryTransactions(filters?: { 
    inventoryItemId?: number, 
    userId?: number, 
    type?: string, 
    startDate?: Date, 
    endDate?: Date 
  }): Promise<InventoryTransaction[]> {
    let transactions = Array.from(this.inventoryTransactions.values());
    
    if (filters) {
      if (filters.inventoryItemId !== undefined) {
        transactions = transactions.filter(tx => tx.inventoryItemId === filters.inventoryItemId);
      }
      
      if (filters.userId !== undefined) {
        transactions = transactions.filter(tx => tx.userId === filters.userId);
      }
      
      if (filters.type !== undefined) {
        transactions = transactions.filter(tx => tx.type === filters.type);
      }
      
      if (filters.startDate !== undefined) {
        transactions = transactions.filter(tx => tx.date >= filters.startDate);
      }
      
      if (filters.endDate !== undefined) {
        transactions = transactions.filter(tx => tx.date <= filters.endDate);
      }
    }
    
    // Sort by date descending
    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
  
  async getInventoryItemsByTechnician(technicianId: number): Promise<{ item: InventoryItem, quantity: number }[]> {
    // Get all "out" transactions for this technician that haven't been returned
    const checkouts = await this.listInventoryTransactions({ 
      userId: technicianId, 
      type: 'out' 
    });
    
    const returns = await this.listInventoryTransactions({ 
      userId: technicianId, 
      type: 'return' 
    });
    
    // Calculate net quantities by item
    const itemQuantities = new Map<number, number>();
    
    // Add checkouts
    for (const checkout of checkouts) {
      const currentQty = itemQuantities.get(checkout.inventoryItemId) || 0;
      itemQuantities.set(checkout.inventoryItemId, currentQty + checkout.quantity);
    }
    
    // Subtract returns
    for (const returnTx of returns) {
      const currentQty = itemQuantities.get(returnTx.inventoryItemId) || 0;
      itemQuantities.set(returnTx.inventoryItemId, Math.max(0, currentQty - returnTx.quantity));
    }
    
    // Build the result
    const result: { item: InventoryItem, quantity: number }[] = [];
    
    for (const [itemId, quantity] of itemQuantities.entries()) {
      if (quantity > 0) {
        const item = this.inventoryItems.get(itemId);
        if (item) {
          result.push({ item, quantity });
        }
      }
    }
    
    return result;
  }
  
  private userIdCounter: number;
  private customerIdCounter: number;
  private vehicleIdCounter: number;
  private serviceIdCounter: number;
  private jobIdCounter: number;
  private jobServiceIdCounter: number;
  private invoiceIdCounter: number;
  private paymentIdCounter: number;
  private activityIdCounter: number;
  private reviewIdCounter: number;
  private membershipPlanIdCounter: number;
  private customerSubscriptionIdCounter: number;
  private inventoryItemIdCounter: number;
  private inventoryTransactionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.customers = new Map();
    this.vehicles = new Map();
    this.services = new Map();
    this.jobs = new Map();
    this.jobServices = new Map();
    this.invoices = new Map();
    this.payments = new Map();
    this.activities = new Map();
    this.reviews = new Map();
    this.membershipPlans = new Map();
    this.customerSubscriptions = new Map();
    this.inventoryItems = new Map();
    this.inventoryTransactions = new Map();
    
    this.userIdCounter = 1;
    this.customerIdCounter = 1;
    this.vehicleIdCounter = 1;
    this.serviceIdCounter = 1;
    this.jobIdCounter = 1;
    this.jobServiceIdCounter = 1;
    this.invoiceIdCounter = 1;
    this.paymentIdCounter = 1;
    this.activityIdCounter = 1;
    this.reviewIdCounter = 1;
    this.membershipPlanIdCounter = 1;
    this.customerSubscriptionIdCounter = 1;
    this.inventoryItemIdCounter = 1;
    this.inventoryTransactionIdCounter = 1;
    
    // Initialize with demo data
    this.initializeDemoData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Customer methods
  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(customerData: InsertCustomer): Promise<Customer> {
    const id = this.customerIdCounter++;
    const customer: Customer = { ...customerData, id, createdAt: new Date() };
    this.customers.set(id, customer);
    
    // Create activity for new customer
    await this.createActivity({
      type: 'customer_created',
      customerId: id,
      description: `New customer ${customerData.fullName} was added`,
      timestamp: new Date(),
      metadata: null
    });
    
    return customer;
  }
  
  async updateCustomer(id: number, customerData: Partial<Customer>): Promise<Customer | undefined> {
    const existingCustomer = this.customers.get(id);
    if (!existingCustomer) return undefined;
    
    const updatedCustomer = { ...existingCustomer, ...customerData };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }
  
  async listCustomers(page: number = 1, pageSize: number = 10, search?: string): Promise<{ customers: Customer[], total: number }> {
    let customers = Array.from(this.customers.values());
    
    if (search) {
      const searchLower = search.toLowerCase();
      customers = customers.filter(customer => 
        customer.fullName.toLowerCase().includes(searchLower) ||
        (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
        (customer.phoneNumber && customer.phoneNumber.includes(search))
      );
    }
    
    const total = customers.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedCustomers = customers.slice(start, end);
    
    return { customers: paginatedCustomers, total };
  }
  
  async deleteCustomer(id: number): Promise<boolean> {
    return this.customers.delete(id);
  }

  // Vehicle methods
  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async createVehicle(vehicleData: InsertVehicle): Promise<Vehicle> {
    const id = this.vehicleIdCounter++;
    const vehicle: Vehicle = { ...vehicleData, id };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }
  
  async updateVehicle(id: number, vehicleData: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const existingVehicle = this.vehicles.get(id);
    if (!existingVehicle) return undefined;
    
    const updatedVehicle = { ...existingVehicle, ...vehicleData };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }
  
  async listVehiclesByCustomer(customerId: number): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values()).filter(
      vehicle => vehicle.customerId === customerId
    );
  }
  
  async deleteVehicle(id: number): Promise<boolean> {
    return this.vehicles.delete(id);
  }

  // Service methods
  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(serviceData: InsertService): Promise<Service> {
    const id = this.serviceIdCounter++;
    const service: Service = { ...serviceData, id };
    this.services.set(id, service);
    return service;
  }
  
  async updateService(id: number, serviceData: Partial<Service>): Promise<Service | undefined> {
    const existingService = this.services.get(id);
    if (!existingService) return undefined;
    
    const updatedService = { ...existingService, ...serviceData };
    this.services.set(id, updatedService);
    return updatedService;
  }
  
  async listServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }
  
  async deleteService(id: number): Promise<boolean> {
    return this.services.delete(id);
  }

  // Job methods
  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async createJob(jobData: InsertJob): Promise<Job> {
    const id = this.jobIdCounter++;
    const job: Job = { 
      ...jobData, 
      id, 
      createdAt: new Date(),
      actualStartTime: null,
      actualEndTime: null
    };
    this.jobs.set(id, job);
    
    // Create activity for new job
    const customer = await this.getCustomer(jobData.customerId);
    if (customer) {
      await this.createActivity({
        type: 'job_scheduled',
        customerId: jobData.customerId,
        jobId: id,
        description: `Job scheduled for ${customer.fullName}`,
        timestamp: new Date(),
        metadata: null
      });
    }
    
    return job;
  }
  
  async updateJob(id: number, jobData: Partial<Job>): Promise<Job | undefined> {
    const existingJob = this.jobs.get(id);
    if (!existingJob) return undefined;
    
    const updatedJob = { ...existingJob, ...jobData };
    this.jobs.set(id, updatedJob);
    
    // Create activity for job status change if status changed
    if (jobData.status && jobData.status !== existingJob.status) {
      const customer = await this.getCustomer(existingJob.customerId);
      if (customer) {
        await this.createActivity({
          type: `job_${jobData.status}`,
          customerId: existingJob.customerId,
          jobId: id,
          description: `Job for ${customer.fullName} marked as ${jobData.status}`,
          timestamp: new Date(),
          metadata: null
        });
      }
    }
    
    return updatedJob;
  }
  
  async listJobs(filters?: { 
    status?: string, 
    technicianId?: number, 
    customerId?: number,
    startDate?: Date,
    endDate?: Date
  }): Promise<Job[]> {
    let jobs = Array.from(this.jobs.values());
    
    if (filters) {
      if (filters.status) {
        jobs = jobs.filter(job => job.status === filters.status);
      }
      
      if (filters.technicianId) {
        jobs = jobs.filter(job => job.technicianId === filters.technicianId);
      }
      
      if (filters.customerId) {
        jobs = jobs.filter(job => job.customerId === filters.customerId);
      }
      
      if (filters.startDate) {
        jobs = jobs.filter(job => job.scheduledStartTime >= filters.startDate);
      }
      
      if (filters.endDate) {
        jobs = jobs.filter(job => job.scheduledStartTime <= filters.endDate);
      }
    }
    
    // Sort by scheduled start time
    jobs.sort((a, b) => a.scheduledStartTime.getTime() - b.scheduledStartTime.getTime());
    
    return jobs;
  }
  
  async deleteJob(id: number): Promise<boolean> {
    return this.jobs.delete(id);
  }

  // JobService methods
  async getJobService(id: number): Promise<JobService | undefined> {
    return this.jobServices.get(id);
  }

  async createJobService(jobServiceData: InsertJobService): Promise<JobService> {
    const id = this.jobServiceIdCounter++;
    const jobService: JobService = { ...jobServiceData, id };
    this.jobServices.set(id, jobService);
    return jobService;
  }
  
  async updateJobService(id: number, jobServiceData: Partial<JobService>): Promise<JobService | undefined> {
    const existingJobService = this.jobServices.get(id);
    if (!existingJobService) return undefined;
    
    const updatedJobService = { ...existingJobService, ...jobServiceData };
    this.jobServices.set(id, updatedJobService);
    return updatedJobService;
  }
  
  async listJobServicesByJob(jobId: number): Promise<JobService[]> {
    return Array.from(this.jobServices.values()).filter(
      jobService => jobService.jobId === jobId
    );
  }
  
  async deleteJobService(id: number): Promise<boolean> {
    return this.jobServices.delete(id);
  }

  // Invoice methods
  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }
  
  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined> {
    return Array.from(this.invoices.values()).find(
      invoice => invoice.invoiceNumber === invoiceNumber
    );
  }

  async createInvoice(invoiceData: InsertInvoice): Promise<Invoice> {
    const id = this.invoiceIdCounter++;
    const invoice: Invoice = { ...invoiceData, id };
    this.invoices.set(id, invoice);
    
    // Get job and customer info for activity
    const job = await this.getJob(invoiceData.jobId);
    if (job) {
      const customer = await this.getCustomer(job.customerId);
      if (customer) {
        await this.createActivity({
          type: 'invoice_created',
          customerId: job.customerId,
          jobId: job.id,
          invoiceId: id,
          description: `Invoice #${invoiceData.invoiceNumber} created for ${customer.fullName}`,
          timestamp: new Date(),
          metadata: null
        });
      }
    }
    
    return invoice;
  }
  
  async updateInvoice(id: number, invoiceData: Partial<Invoice>): Promise<Invoice | undefined> {
    const existingInvoice = this.invoices.get(id);
    if (!existingInvoice) return undefined;
    
    const updatedInvoice = { ...existingInvoice, ...invoiceData };
    this.invoices.set(id, updatedInvoice);
    
    // If invoice was marked as paid
    if (invoiceData.paid && !existingInvoice.paid) {
      const job = await this.getJob(existingInvoice.jobId);
      if (job) {
        const customer = await this.getCustomer(job.customerId);
        if (customer) {
          await this.createActivity({
            type: 'invoice_paid',
            customerId: job.customerId,
            jobId: job.id,
            invoiceId: id,
            description: `Invoice #${existingInvoice.invoiceNumber} paid by ${customer.fullName}`,
            timestamp: new Date(),
            metadata: null
          });
        }
      }
    }
    
    return updatedInvoice;
  }
  
  async listInvoices(filters?: { customerId?: number, paid?: boolean }): Promise<Invoice[]> {
    let invoices = Array.from(this.invoices.values());
    
    if (filters) {
      if (filters.customerId !== undefined) {
        const customerJobs = await this.listJobs({ customerId: filters.customerId });
        const jobIds = customerJobs.map(job => job.id);
        invoices = invoices.filter(invoice => jobIds.includes(invoice.jobId));
      }
      
      if (filters.paid !== undefined) {
        invoices = invoices.filter(invoice => invoice.paid === filters.paid);
      }
    }
    
    return invoices;
  }
  
  async deleteInvoice(id: number): Promise<boolean> {
    return this.invoices.delete(id);
  }

  // Payment methods
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const id = this.paymentIdCounter++;
    const payment: Payment = { ...paymentData, id };
    this.payments.set(id, payment);
    
    // Update invoice paid status if needed
    const invoice = await this.getInvoice(paymentData.invoiceId);
    if (invoice) {
      const allPayments = await this.listPaymentsByInvoice(paymentData.invoiceId);
      const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0) + paymentData.amount;
      
      if (totalPaid >= invoice.total && !invoice.paid) {
        await this.updateInvoice(invoice.id, {
          paid: true,
          paidDate: new Date(),
          paidAmount: totalPaid
        });
      }
      
      // Create activity for payment
      const job = await this.getJob(invoice.jobId);
      if (job) {
        const customer = await this.getCustomer(job.customerId);
        if (customer) {
          await this.createActivity({
            type: 'payment_received',
            customerId: job.customerId,
            jobId: job.id,
            invoiceId: invoice.id,
            description: `Payment of $${paymentData.amount.toFixed(2)} received for invoice #${invoice.invoiceNumber}`,
            timestamp: new Date(),
            metadata: {
              amount: paymentData.amount,
              method: paymentData.method
            }
          });
        }
      }
    }
    
    return payment;
  }
  
  async listPaymentsByInvoice(invoiceId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      payment => payment.invoiceId === invoiceId
    );
  }

  // Activity methods
  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const activity: Activity = { ...activityData, id };
    this.activities.set(id, activity);
    return activity;
  }
  
  async listActivitiesByCustomer(customerId: number, limit: number = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.customerId === customerId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  async listRecentActivities(limit: number = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Review methods
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const review: Review = { ...reviewData, id };
    this.reviews.set(id, review);
    
    // Create activity for new review
    const customer = await this.getCustomer(reviewData.customerId);
    if (customer) {
      await this.createActivity({
        type: 'review_received',
        customerId: reviewData.customerId,
        jobId: reviewData.jobId,
        description: `Review (${reviewData.rating}/5) received from ${customer.fullName}`,
        timestamp: new Date(),
        metadata: {
          rating: reviewData.rating,
          source: reviewData.source
        }
      });
    }
    
    return review;
  }
  
  async updateReview(id: number, reviewData: Partial<Review>): Promise<Review | undefined> {
    const existingReview = this.reviews.get(id);
    if (!existingReview) return undefined;
    
    const updatedReview = { ...existingReview, ...reviewData };
    this.reviews.set(id, updatedReview);
    
    // If adding a response
    if (reviewData.responded && !existingReview.responded && reviewData.responseText) {
      const customer = await this.getCustomer(existingReview.customerId);
      if (customer) {
        await this.createActivity({
          type: 'review_responded',
          customerId: existingReview.customerId,
          description: `Responded to review from ${customer.fullName}`,
          timestamp: new Date(),
          metadata: null
        });
      }
    }
    
    return updatedReview;
  }
  
  async listReviews(limit: number = 10): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  // Dashboard/reporting methods
  async getRevenueStats(startDate: Date, endDate: Date): Promise<{
    totalRevenue: number;
    jobsCompleted: number;
    newCustomers: number;
    avgJobValue: number;
  }> {
    // Get completed jobs
    const completedJobs = await this.listJobs({
      status: 'completed',
      startDate,
      endDate
    });
    
    // Get invoices for these jobs
    const jobIds = completedJobs.map(job => job.id);
    const invoices = Array.from(this.invoices.values())
      .filter(invoice => jobIds.includes(invoice.jobId));
    
    const totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.paid ? invoice.paidAmount || 0 : 0), 0);
    
    // Get new customers in period
    const newCustomers = Array.from(this.customers.values())
      .filter(customer => customer.createdAt >= startDate && customer.createdAt <= endDate)
      .length;
    
    const avgJobValue = completedJobs.length > 0 ? totalRevenue / completedJobs.length : 0;
    
    return {
      totalRevenue,
      jobsCompleted: completedJobs.length,
      newCustomers,
      avgJobValue
    };
  }
  
  async getTopServices(startDate: Date, endDate: Date, limit: number = 5): Promise<{
    serviceId: number;
    serviceName: string;
    revenue: number;
    count: number;
  }[]> {
    // Get completed jobs in date range
    const completedJobs = await this.listJobs({
      status: 'completed',
      startDate,
      endDate
    });
    
    const jobIds = completedJobs.map(job => job.id);
    
    // Get all job services for these jobs
    const relevantJobServices = Array.from(this.jobServices.values())
      .filter(js => jobIds.includes(js.jobId));
    
    // Group by service and calculate totals
    const serviceStats = new Map<number, { revenue: number, count: number }>();
    
    for (const js of relevantJobServices) {
      const current = serviceStats.get(js.serviceId) || { revenue: 0, count: 0 };
      serviceStats.set(js.serviceId, {
        revenue: current.revenue + (js.price * js.quantity),
        count: current.count + js.quantity
      });
    }
    
    // Convert to array and add service names
    const result: { serviceId: number; serviceName: string; revenue: number; count: number; }[] = [];
    
    for (const [serviceId, stats] of serviceStats.entries()) {
      const service = await this.getService(serviceId);
      if (service) {
        result.push({
          serviceId,
          serviceName: service.name,
          revenue: stats.revenue,
          count: stats.count
        });
      }
    }
    
    // Sort by revenue and limit
    return result
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  // Helper method to initialize membership plans
  private async initializeMembershipPlans() {
    // Only create plans if none exist
    if (this.membershipPlans.size === 0) {
      // Basic Plan
      const basicPlan: InsertMembershipPlan = {
        name: "Basic Care",
        description: "Basic car care package for occasional detailing needs",
        monthlyPrice: 29.99,
        annualPrice: 299.99,
        features: [
          "1 Basic Wash per month",
          "10% off additional services",
          "Online scheduling priority"
        ],
        active: true
      };
      
      // Premium Plan
      const premiumPlan: InsertMembershipPlan = {
        name: "Premium Shine",
        description: "Enhanced detailing package for regular maintenance",
        monthlyPrice: 59.99,
        annualPrice: 599.99,
        features: [
          "2 Premium Washes per month",
          "1 Interior Detail per quarter",
          "15% off additional services",
          "Priority scheduling",
          "Free product samples"
        ],
        active: true
      };
      
      // Ultimate Plan
      const ultimatePlan: InsertMembershipPlan = {
        name: "Ultimate Protection",
        description: "Comprehensive care package for pristine vehicle maintenance",
        monthlyPrice: 99.99,
        annualPrice: 999.99,
        features: [
          "Unlimited Basic Washes",
          "1 Full Detail per month",
          "Quarterly Paint Protection",
          "25% off additional services",
          "VIP scheduling",
          "Emergency cleaning services",
          "Annual ceramic coating refresh"
        ],
        active: true
      };
      
      // Add plans to storage
      await this.createMembershipPlan(basicPlan);
      await this.createMembershipPlan(premiumPlan);
      await this.createMembershipPlan(ultimatePlan);
    }
  }
  
  private async initializeDemoData() {
    // Initialize demo membership plans
    await this.initializeMembershipPlans();
    // Create default admin user
    await this.createUser({
      username: "admin",
      password: "password",
      email: "admin@detailpro.com",
      fullName: "Mike Johnson",
      role: "admin",
      phoneNumber: "555-123-4567",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });
    
    // Create demo technicians
    await this.createUser({
      username: "john",
      password: "password",
      email: "john@detailpro.com",
      fullName: "John Smith",
      role: "technician",
      phoneNumber: "555-987-6543",
      avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });

    // Create default services
    const fullDetail = await this.createService({
      name: "Full Detail",
      description: "Complete interior and exterior detailing service",
      price: 249.99,
      duration: 240, // 4 hours
      active: true,
      color: "#3b82f6" // blue
    });
    
    const ceramicCoating = await this.createService({
      name: "Ceramic Coating",
      description: "Professional ceramic coating application",
      price: 599.99,
      duration: 360, // 6 hours
      active: true,
      color: "#f97316" // orange
    });
    
    const interiorDetail = await this.createService({
      name: "Interior Detail",
      description: "Complete interior cleaning and detailing",
      price: 149.99,
      duration: 120, // 2 hours
      active: true,
      color: "#10b981" // green
    });
    
    const exteriorDetail = await this.createService({
      name: "Exterior Detail",
      description: "Wash, clay bar, polish, and wax",
      price: 129.99,
      duration: 120, // 2 hours
      active: true,
      color: "#f59e0b" // amber
    });

    // Create demo customers
    const james = await this.createCustomer({
      fullName: "James Wilson",
      email: "james@example.com",
      phoneNumber: "555-111-2222",
      address: "1234 Main St",
      city: "Anytown",
      state: "CA",
      zipCode: "90210",
      notes: "VIP customer, prefers weekend appointments",
      tags: ["VIP"]
    });
    
    const sarah = await this.createCustomer({
      fullName: "Sarah Chen",
      email: "sarah@example.com",
      phoneNumber: "555-222-3333",
      address: "4567 Oak Ave",
      city: "Anytown",
      state: "CA",
      zipCode: "90211",
      notes: "Prefers text message communication",
      tags: ["Auto"]
    });
    
    const mark = await this.createCustomer({
      fullName: "Mark Johnson",
      email: "mark@example.com",
      phoneNumber: "555-333-4444",
      address: "7890 Pine St",
      city: "Anytown",
      state: "CA",
      zipCode: "90212",
      notes: "Has a large dog that sheds a lot",
      tags: ["Auto"]
    });

    // Create vehicles for customers
    const jamesTesla = await this.createVehicle({
      customerId: james.id,
      type: "car",
      make: "Tesla",
      model: "Model 3",
      year: 2022,
      color: "White",
      licensePlate: "EV123CA",
      vin: "5YJ3E1EA1LF123456",
      notes: "Dual motor version"
    });
    
    const sarahHonda = await this.createVehicle({
      customerId: sarah.id,
      type: "car",
      make: "Honda",
      model: "Civic",
      year: 2020,
      color: "Silver",
      licensePlate: "ABC789",
      vin: "1HGBH41JXMN109876",
      notes: "Leather interior"
    });
    
    const markFord = await this.createVehicle({
      customerId: mark.id,
      type: "truck",
      make: "Ford",
      model: "F-150",
      year: 2019,
      color: "Black",
      licensePlate: "TRK456",
      vin: "1FTEW1E5XJFD12345",
      notes: "King Ranch edition"
    });

    // Create demo jobs
    // Current date
    const now = new Date();
    
    // Create job for James Wilson - in progress today
    const jamesJob = await this.createJob({
      customerId: james.id,
      vehicleId: jamesTesla.id,
      technicianId: 2, // John Smith
      scheduledStartTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0), // Today 9 AM
      scheduledEndTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0), // Today 11 AM
      address: james.address,
      city: james.city,
      state: james.state,
      zipCode: james.zipCode,
      status: "in_progress",
      notes: "Customer requested special attention to wheels"
    });
    
    // Add services to James's job
    await this.createJobService({
      jobId: jamesJob.id,
      serviceId: fullDetail.id,
      quantity: 1,
      price: fullDetail.price
    });
    
    await this.createJobService({
      jobId: jamesJob.id,
      serviceId: ceramicCoating.id,
      quantity: 1,
      price: ceramicCoating.price
    });
    
    // Create job for Sarah Chen - upcoming today
    const sarahJob = await this.createJob({
      customerId: sarah.id,
      vehicleId: sarahHonda.id,
      technicianId: 2, // John Smith
      scheduledStartTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 30), // Today 1:30 PM
      scheduledEndTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0), // Today 3:00 PM
      address: sarah.address,
      city: sarah.city,
      state: sarah.state,
      zipCode: sarah.zipCode,
      status: "scheduled",
      notes: "Customer requested extra attention to floor mats"
    });
    
    // Add service to Sarah's job
    await this.createJobService({
      jobId: sarahJob.id,
      serviceId: interiorDetail.id,
      quantity: 1,
      price: interiorDetail.price
    });
    
    // Create job for Mark Johnson - upcoming today
    const markJob = await this.createJob({
      customerId: mark.id,
      vehicleId: markFord.id,
      technicianId: 2, // John Smith
      scheduledStartTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0), // Today 4:00 PM
      scheduledEndTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 30), // Today 5:30 PM
      address: mark.address,
      city: mark.city,
      state: mark.state,
      zipCode: mark.zipCode,
      status: "scheduled",
      notes: "Truck is lifted, may need extra time"
    });
    
    // Add service to Mark's job
    await this.createJobService({
      jobId: markJob.id,
      serviceId: exteriorDetail.id,
      quantity: 1,
      price: exteriorDetail.price
    });

    // Create demo completed jobs and invoices for past revenue
    // Create a series of completed jobs for the past month
    const pastMonthStart = new Date(now);
    pastMonthStart.setMonth(now.getMonth() - 1);
    pastMonthStart.setDate(1);
    
    const pastMonthEnd = new Date(now);
    pastMonthEnd.setDate(0); // Last day of previous month
    
    // Create 30 random completed jobs over the past month
    for (let i = 0; i < 30; i++) {
      // Random date in past month
      const jobDate = new Date(pastMonthStart.getTime() + Math.random() * (pastMonthEnd.getTime() - pastMonthStart.getTime()));
      
      // Randomly select customer and vehicle
      const customerId = Math.random() > 0.3 ? james.id : Math.random() > 0.5 ? sarah.id : mark.id;
      
      let vehicleId;
      switch (customerId) {
        case james.id:
          vehicleId = jamesTesla.id;
          break;
        case sarah.id:
          vehicleId = sarahHonda.id;
          break;
        default:
          vehicleId = markFord.id;
      }
      
      // Create job
      const pastJob = await this.createJob({
        customerId,
        vehicleId,
        technicianId: 2,
        scheduledStartTime: new Date(jobDate.setHours(9 + Math.floor(Math.random() * 8))),
        scheduledEndTime: new Date(new Date(jobDate).setHours(jobDate.getHours() + 2)),
        address: "123 Service St",
        city: "Anytown",
        state: "CA",
        zipCode: "90210",
        status: "completed",
        notes: "Completed job"
      });
      
      // Add 1-2 random services
      const serviceId1 = Math.floor(Math.random() * 4) + 1; // Random service 1-4
      await this.createJobService({
        jobId: pastJob.id,
        serviceId: serviceId1,
        quantity: 1,
        price: this.services.get(serviceId1)?.price || 149.99
      });
      
      // Maybe add second service
      if (Math.random() > 0.7) {
        let serviceId2;
        do {
          serviceId2 = Math.floor(Math.random() * 4) + 1;
        } while (serviceId2 === serviceId1);
        
        await this.createJobService({
          jobId: pastJob.id,
          serviceId: serviceId2,
          quantity: 1,
          price: this.services.get(serviceId2)?.price || 149.99
        });
      }
      
      // Calculate invoice based on job services
      const jobServicesList = await this.listJobServicesByJob(pastJob.id);
      const subtotal = jobServicesList.reduce((total, js) => total + (js.price * js.quantity), 0);
      const taxRate = 0.0825; // 8.25% tax
      const taxAmount = subtotal * taxRate;
      const total = subtotal + taxAmount;
      
      // Create invoice
      const invoice = await this.createInvoice({
        jobId: pastJob.id,
        invoiceNumber: `INV-${10000 + i}`,
        issueDate: new Date(jobDate),
        dueDate: new Date(new Date(jobDate).setDate(jobDate.getDate() + 15)),
        subtotal,
        taxRate,
        taxAmount,
        discountAmount: 0,
        total,
        paid: true,
        paidDate: new Date(jobDate),
        paidAmount: total,
        notes: ""
      });
      
      // Create payment
      await this.createPayment({
        invoiceId: invoice.id,
        amount: total,
        method: Math.random() > 0.6 ? "credit_card" : Math.random() > 0.5 ? "cash" : "check",
        transactionId: Math.random() > 0.6 ? `txn_${Math.random().toString(36).substring(2, 10)}` : undefined,
        date: new Date(jobDate),
        notes: ""
      });
    }

    // Create demo reviews
    await this.createReview({
      customerId: james.id,
      jobId: jamesJob.id,
      rating: 5,
      comment: "Absolutely blown away by the ceramic coating job. My car looks better than when I bought it! Will definitely be back.",
      date: new Date(now.setDate(now.getDate() - 2)),
      source: "google",
      responded: false,
      responseText: null,
      responseDate: null
    });
    
    await this.createReview({
      customerId: sarah.id,
      jobId: sarahJob.id,
      rating: 5,
      comment: "Great service! The interior of my car looks and smells brand new. The team was professional and on time.",
      date: new Date(now.setDate(now.getDate() - 5)),
      source: "google",
      responded: false,
      responseText: null,
      responseDate: null
    });
  }
}

export const storage = new MemStorage();
