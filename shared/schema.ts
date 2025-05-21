import { pgTable, text, serial, integer, boolean, timestamp, real, json, uuid } from "drizzle-orm/pg-core";
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
