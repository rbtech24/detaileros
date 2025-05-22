import { pgTable, text, serial, integer, boolean, timestamp, real, json, uuid, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("technician"), // admin, technician
  phoneNumber: text("phone_number"),
  avatarUrl: text("avatar_url"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  role: true,
  phoneNumber: true,
  avatarUrl: true,
});

// Customer schema
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email"),
  phoneNumber: text("phone_number").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  notes: text("notes"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customers).pick({
  fullName: true,
  email: true,
  phoneNumber: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  notes: true,
  tags: true,
});

// Vehicle schema
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // car, truck, suv, boat, motorcycle
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year"),
  color: text("color"),
  licensePlate: text("license_plate"),
  vin: text("vin"),
  notes: text("notes"),
});

export const insertVehicleSchema = createInsertSchema(vehicles).pick({
  customerId: true,
  type: true,
  make: true,
  model: true,
  year: true,
  color: true,
  licensePlate: true,
  vin: true,
  notes: true,
});

// Service schema
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  duration: integer("duration").notNull(), // in minutes
  active: boolean("active").notNull().default(true),
  color: text("color"), // for calendar display
});

export const insertServiceSchema = createInsertSchema(services).pick({
  name: true,
  description: true,
  price: true,
  duration: true,
  active: true,
  color: true,
});

// Job schema
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  vehicleId: integer("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  technicianId: integer("technician_id").references(() => users.id),
  scheduledStartTime: timestamp("scheduled_start_time").notNull(),
  scheduledEndTime: timestamp("scheduled_end_time").notNull(),
  address: text("address"), // Location where service will be performed
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  status: text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  notes: text("notes"),
  actualStartTime: timestamp("actual_start_time"),
  actualEndTime: timestamp("actual_end_time"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobs).pick({
  customerId: true,
  vehicleId: true,
  technicianId: true,
  scheduledStartTime: true,
  scheduledEndTime: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  status: true,
  notes: true,
});

// JobService junction table
export const jobServices = pgTable("job_services", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  serviceId: integer("service_id").notNull().references(() => services.id),
  quantity: integer("quantity").notNull().default(1),
  price: real("price").notNull(), // Store price at time of service
});

export const insertJobServiceSchema = createInsertSchema(jobServices).pick({
  jobId: true,
  serviceId: true,
  quantity: true,
  price: true,
});

// Invoice schema
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  invoiceNumber: text("invoice_number").notNull().unique(),
  issueDate: timestamp("issue_date").notNull().defaultNow(),
  dueDate: timestamp("due_date"),
  subtotal: real("subtotal").notNull(),
  taxRate: real("tax_rate").notNull().default(0),
  taxAmount: real("tax_amount").notNull(),
  discountAmount: real("discount_amount").notNull().default(0),
  total: real("total").notNull(),
  paid: boolean("paid").notNull().default(false),
  paidDate: timestamp("paid_date"),
  paidAmount: real("paid_amount"),
  notes: text("notes"),
});

export const insertInvoiceSchema = createInsertSchema(invoices).pick({
  jobId: true,
  invoiceNumber: true,
  issueDate: true,
  dueDate: true,
  subtotal: true,
  taxRate: true,
  taxAmount: true,
  discountAmount: true,
  total: true,
  paid: true,
  paidDate: true,
  paidAmount: true,
  notes: true,
});

// Payment schema
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  amount: real("amount").notNull(),
  method: text("method").notNull(), // credit_card, cash, check, etc.
  transactionId: text("transaction_id"),
  date: timestamp("date").notNull().defaultNow(),
  notes: text("notes"),
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  invoiceId: true,
  amount: true,
  method: true,
  transactionId: true,
  date: true,
  notes: true,
});

// Activity schema (for activity timeline)
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // payment, job_scheduled, job_completed, etc.
  customerId: integer("customer_id").references(() => customers.id, { onDelete: "cascade" }),
  jobId: integer("job_id").references(() => jobs.id, { onDelete: "cascade" }),
  invoiceId: integer("invoice_id").references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  metadata: json("metadata"), // Additional context-specific data
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  type: true,
  customerId: true,
  jobId: true,
  invoiceId: true,
  description: true,
  timestamp: true,
  metadata: true,
});

// Reviews schema
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  jobId: integer("job_id").references(() => jobs.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  date: timestamp("date").notNull().defaultNow(),
  source: text("source"), // google, yelp, internal, etc.
  responded: boolean("responded").notNull().default(false),
  responseText: text("response_text"),
  responseDate: timestamp("response_date"),
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  customerId: true,
  jobId: true,
  rating: true,
  comment: true,
  date: true,
  source: true,
  responded: true,
  responseText: true,
  responseDate: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type JobService = typeof jobServices.$inferSelect;
export type InsertJobService = z.infer<typeof insertJobServiceSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// Membership Plans schema
export const membershipPlans = pgTable("membership_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  monthlyPrice: real("monthly_price").notNull(),
  annualPrice: real("annual_price"),
  features: text("features").array(),
  discountPercent: real("discount_percent").notNull().default(0), // Discount on services
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertMembershipPlanSchema = createInsertSchema(membershipPlans).pick({
  name: true,
  description: true,
  monthlyPrice: true,
  annualPrice: true,
  features: true,
  discountPercent: true,
  active: true,
});

// Customer Subscriptions schema
export const customerSubscriptions = pgTable("customer_subscriptions", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  planId: integer("plan_id").notNull().references(() => membershipPlans.id),
  status: text("status").notNull().default("active"), // active, canceled, past_due, trialing
  billingCycle: text("billing_cycle").notNull().default("monthly"), // monthly, annual
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  nextBillingDate: date("next_billing_date").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  canceledAt: timestamp("canceled_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCustomerSubscriptionSchema = createInsertSchema(customerSubscriptions).pick({
  customerId: true,
  planId: true,
  status: true,
  billingCycle: true,
  startDate: true,
  endDate: true,
  nextBillingDate: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
});

// Inventory schema
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  category: text("category").notNull(),
  description: text("description"),
  unitPrice: real("unit_price").notNull(),
  costPrice: real("cost_price").notNull(),
  quantityInStock: integer("quantity_in_stock").notNull().default(0),
  minStockLevel: integer("min_stock_level").notNull().default(0),
  supplier: text("supplier"),
  location: text("location"),
  isActive: boolean("is_active").notNull().default(true),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).pick({
  name: true,
  sku: true,
  category: true,
  description: true,
  unitPrice: true,
  costPrice: true,
  quantityInStock: true,
  minStockLevel: true,
  supplier: true,
  location: true,
  isActive: true,
  imageUrl: true,
});

// Inventory Transaction schema for tracking technician usage
export const inventoryTransactions = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(),
  inventoryItemId: integer("inventory_item_id").notNull().references(() => inventoryItems.id),
  quantity: integer("quantity").notNull(),
  type: text("type").notNull(), // in, out, return, adjustment
  reason: text("reason").notNull(), // job, purchase, damaged, etc.
  notes: text("notes"),
  date: timestamp("date").notNull().defaultNow(),
  userId: integer("user_id").references(() => users.id), // Technician who performed the transaction
  jobId: integer("job_id").references(() => jobs.id), // Optional job reference
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).pick({
  inventoryItemId: true,
  quantity: true,
  type: true,
  reason: true,
  notes: true,
  date: true,
  userId: true,
  jobId: true,
});

// Export membership plan and subscription types
export type MembershipPlan = typeof membershipPlans.$inferSelect;
export type InsertMembershipPlan = z.infer<typeof insertMembershipPlanSchema>;

export type CustomerSubscription = typeof customerSubscriptions.$inferSelect;
export type InsertCustomerSubscription = z.infer<typeof insertCustomerSubscriptionSchema>;

// Export inventory types
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;
