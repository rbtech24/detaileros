import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { storage } from "./storage";
import {
  insertCustomerSchema,
  insertVehicleSchema,
  insertServiceSchema,
  insertJobSchema,
  insertJobServiceSchema,
  insertInvoiceSchema,
  insertPaymentSchema,
  insertReviewSchema,
  insertUserSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const api = express.Router();

  // Error handling middleware
  const handleZodError = (err: Error, res: express.Response) => {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({
        message: "Validation error",
        errors: validationError.details,
      });
    }
    return res.status(500).json({ message: err.message || "An error occurred" });
  };

  // Auth routes - basic auth for demo
  api.post("/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          message: "Username and password are required",
        });
      }

      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
        return res.status(401).json({
          message: "Invalid username or password",
        });
      }

      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (err) {
      return res.status(500).json({ message: "Login failed" });
    }
  });

  // Customer routes
  api.get("/customers", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const search = req.query.search as string;

      const result = await storage.listCustomers(page, pageSize, search);
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Failed to retrieve customers" });
    }
  });

  api.get("/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (err) {
      res.status(500).json({ message: "Failed to retrieve customer" });
    }
  });

  api.post("/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (err) {
      handleZodError(err as Error, res);
    }
  });

  api.put("/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, customerData);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (err) {
      handleZodError(err as Error, res);
    }
  });

  api.delete("/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCustomer(id);
      if (!success) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Vehicle routes
  api.get("/customers/:customerId/vehicles", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const vehicles = await storage.listVehiclesByCustomer(customerId);
      res.json(vehicles);
    } catch (err) {
      res.status(500).json({ message: "Failed to retrieve vehicles" });
    }
  });

  api.get("/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (err) {
      res.status(500).json({ message: "Failed to retrieve vehicle" });
    }
  });

  api.post("/vehicles", async (req, res) => {
    try {
      const vehicleData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(vehicleData);
      res.status(201).json(vehicle);
    } catch (err) {
      handleZodError(err as Error, res);
    }
  });

  api.put("/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicleData = insertVehicleSchema.partial().parse(req.body);
      const vehicle = await storage.updateVehicle(id, vehicleData);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (err) {
      handleZodError(err as Error, res);
    }
  });

  api.delete("/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteVehicle(id);
      if (!success) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete vehicle" });
    }
  });

  // Service routes
  api.get("/services", async (req, res) => {
    try {
      const services = await storage.listServices();
      res.json(services);
    } catch (err) {
      res.status(500).json({ message: "Failed to retrieve services" });
    }
  });

  api.get("/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getService(id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (err) {
      res.status(500).json({ message: "Failed to retrieve service" });
    }
  });

  api.post("/services", async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.status(201).json(service);
    } catch (err) {
      handleZodError(err as Error, res);
    }
  });

  api.put("/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const serviceData = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(id, serviceData);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (err) {
      handleZodError(err as Error, res);
    }
  });

  api.delete("/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteService(id);
      if (!success) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Job routes
  api.get("/jobs", async (req, res) => {
    try {
      const filters: {
        status?: string;
        technicianId?: number;
        customerId?: number;
        startDate?: Date;
        endDate?: Date;
      } = {};

      if (req.query.status) filters.status = req.query.status as string;
      if (req.query.technicianId)
        filters.technicianId = parseInt(req.query.technicianId as string);
      if (req.query.customerId)
        filters.customerId = parseInt(req.query.customerId as string);
      if (req.query.startDate)
        filters.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate)
        filters.endDate = new Date(req.query.endDate as string);

      const jobs = await storage.listJobs(filters);

      // Enrich job data with related entities
      const enrichedJobs = await Promise.all(
        jobs.map(async (job) => {
          const customer = await storage.getCustomer(job.customerId);
          const vehicle = await storage.getVehicle(job.vehicleId);
          const technician = job.technicianId ? await storage.getUser(job.technicianId) : null;
          const jobServices = await storage.listJobServicesByJob(job.id);

          const services = await Promise.all(
            jobServices.map(async (js) => {
              const service = await storage.getService(js.serviceId);
              return {
                ...js,
                serviceName: service?.name || "Unknown Service",
              };
            })
          );

          return {
            ...job,
            customer: customer || null,
            vehicle: vehicle || null,
            technician: technician ? {
              id: technician.id,
              fullName: technician.fullName,
              email: technician.email,
              role: technician.role
            } : null,
            services,
          };
        })
      );

      res.json(enrichedJobs);
    } catch (err) {
      res.status(500).json({ message: "Failed to retrieve jobs" });
    }
  });

  api.get("/jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getJob(id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      const customer = await storage.getCustomer(job.customerId);
      const vehicle = await storage.getVehicle(job.vehicleId);
      const technician = job.technicianId
        ? await storage.getUser(job.technicianId)
        : null;
      const jobServices = await storage.listJobServicesByJob(job.id);

      const services = await Promise.all(
        jobServices.map(async (js) => {
          const service = await storage.getService(js.serviceId);
          return {
            ...js,
            serviceName: service?.name || "Unknown Service",
          };
        })
      );

      res.json({
        ...job,
        customer: customer || null,
        vehicle: vehicle || null,
        technician: technician ? {
          id: technician.id,
          fullName: technician.fullName,
          email: technician.email,
          role: technician.role
        } : null,
        services,
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to retrieve job" });
    }
  });

  api.post("/jobs", async (req, res) => {
    try {
      const jobData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(jobData);

      // If services are provided, add them to the job
      if (req.body.services && Array.isArray(req.body.services)) {
        for (const serviceItem of req.body.services) {
          const { serviceId, quantity = 1 } = serviceItem;
          const service = await storage.getService(serviceId);
          if (service) {
            await storage.createJobService({
              jobId: job.id,
              serviceId: service.id,
              quantity,
              price: service.price,
            });
          }
        }
      }

      res.status(201).json(job);
    } catch (err) {
      handleZodError(err as Error, res);
    }
  });

  api.put("/jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const jobData = insertJobSchema.partial().parse(req.body);
      const job = await storage.updateJob(id, jobData);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Update services if provided
      if (req.body.services && Array.isArray(req.body.services)) {
        // First remove existing job services
        const existingServices = await storage.listJobServicesByJob(id);
        for (const service of existingServices) {
          await storage.deleteJobService(service.id);
        }

        // Then add new services
        for (const serviceItem of req.body.services) {
          const { serviceId, quantity = 1 } = serviceItem;
          const service = await storage.getService(serviceId);
          if (service) {
            await storage.createJobService({
              jobId: job.id,
              serviceId: service.id,
              quantity,
              price: service.price,
            });
          }
        }
      }

      res.json(job);
    } catch (err) {
      handleZodError(err as Error, res);
    }
  });

  api.delete("/jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteJob(id);
      if (!success) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  // Invoice routes
  api.get("/invoices", async (req, res) => {
    try {
      const filters: { customerId?: number; paid?: boolean } = {};

      if (req.query.customerId)
        filters.customerId = parseInt(req.query.customerId as string);
      if (req.query.paid !== undefined)
        filters.paid = req.query.paid === "true";

      const invoices = await storage.listInvoices(filters);

      // Enrich invoice data with related entities
      const enrichedInvoices = await Promise.all(
        invoices.map(async (invoice) => {
          const job = await storage.getJob(invoice.jobId);
          const customer = job ? await storage.getCustomer(job.customerId) : null;
          const payments = await storage.listPaymentsByInvoice(invoice.id);

          return {
            ...invoice,
            job: job || null,
            customer: customer || null,
            payments,
          };
        })
      );

      res.json(enrichedInvoices);
    } catch (err) {
      res.status(500).json({ message: "Failed to retrieve invoices" });
    }
  });

  api.get("/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      const job = await storage.getJob(invoice.jobId);
      const customer = job ? await storage.getCustomer(job.customerId) : null;
      const vehicle = job ? await storage.getVehicle(job.vehicleId) : null;
      const jobServices = job ? await storage.listJobServicesByJob(job.id) : [];
      const payments = await storage.listPaymentsByInvoice(invoice.id);

      const services = await Promise.all(
        jobServices.map(async (js) => {
          const service = await storage.getService(js.serviceId);
          return {
            ...js,
            serviceName: service?.name || "Unknown Service",
            serviceDescription: service?.description || "",
          };
        })
      );

      res.json({
        ...invoice,
        job,
        customer,
        vehicle,
        services,
        payments,
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to retrieve invoice" });
    }
  });

  api.post("/invoices", async (req, res) => {
    try {
      const invoiceData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(invoiceData);
      res.status(201).json(invoice);
    } catch (err) {
      handleZodError(err as Error, res);
    }
  });

  api.put("/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoiceData = insertInvoiceSchema.partial().parse(req.body);
      const invoice = await storage.updateInvoice(id, invoiceData);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (err) {
      handleZodError(err as Error, res);
    }
  });

  // Payment routes
  api.post("/payments", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (err) {
      handleZodError(err as Error, res);
    }
  });

  api.get("/invoices/:invoiceId/payments", async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.invoiceId);
      const payments = await storage.listPaymentsByInvoice(invoiceId);
      res.json(payments);
    } catch (err) {
      res.status(500).json({ message: "Failed to retrieve payments" });
    }
  });

  // Activity routes
  api.get("/activities", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await storage.listRecentActivities(limit);
      
      // Enrich activities with related data
      const enrichedActivities = await Promise.all(
        activities.map(async (activity) => {
          let enriched: any = { ...activity };
          
          if (activity.customerId) {
            const customer = await storage.getCustomer(activity.customerId);
            if (customer) {
              enriched.customer = {
                id: customer.id,
                fullName: customer.fullName,
                email: customer.email,
                phoneNumber: customer.phoneNumber
              };
            }
          }
          
          if (activity.jobId) {
            const job = await storage.getJob(activity.jobId);
            if (job) {
              enriched.job = {
                id: job.id,
                status: job.status,
                scheduledStartTime: job.scheduledStartTime,
                scheduledEndTime: job.scheduledEndTime
              };
            }
          }
          
          if (activity.invoiceId) {
            const invoice = await storage.getInvoice(activity.invoiceId);
            if (invoice) {
              enriched.invoice = {
                id: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                total: invoice.total,
                paid: invoice.paid
              };
            }
          }
          
          return enriched;
        })
      );
      
      res.json(enrichedActivities);
    } catch (err) {
      res.status(500).json({ message: "Failed to retrieve activities" });
    }
  });

  api.get("/customers/:customerId/activities", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await storage.listActivitiesByCustomer(customerId, limit);
      res.json(activities);
    } catch (err) {
      res.status(500).json({ message: "Failed to retrieve activities" });
    }
  });

  // Review routes
  api.get("/reviews", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const reviews = await storage.listReviews(limit);
      
      // Enrich reviews with customer data
      const enrichedReviews = await Promise.all(
        reviews.map(async (review) => {
          const customer = await storage.getCustomer(review.customerId);
          return {
            ...review,
            customer: customer ? {
              id: customer.id,
              fullName: customer.fullName,
              email: customer.email
            } : null
          };
        })
      );
      
      res.json(enrichedReviews);
    } catch (err) {
      res.status(500).json({ message: "Failed to retrieve reviews" });
    }
  });

  api.post("/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (err) {
      handleZodError(err as Error, res);
    }
  });

  api.put("/reviews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reviewData = insertReviewSchema.partial().parse(req.body);
      const review = await storage.updateReview(id, reviewData);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json(review);
    } catch (err) {
      handleZodError(err as Error, res);
    }
  });

  // Dashboard/Stats routes
  api.get("/stats/revenue", async (req, res) => {
    try {
      const startDateStr = req.query.startDate as string;
      const endDateStr = req.query.endDate as string;
      
      if (!startDateStr || !endDateStr) {
        return res.status(400).json({ message: "startDate and endDate are required" });
      }
      
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      const stats = await storage.getRevenueStats(startDate, endDate);
      res.json(stats);
    } catch (err) {
      res.status(500).json({ message: "Failed to retrieve revenue stats" });
    }
  });

  api.get("/stats/top-services", async (req, res) => {
    try {
      const startDateStr = req.query.startDate as string;
      const endDateStr = req.query.endDate as string;
      const limit = parseInt(req.query.limit as string) || 5;
      
      if (!startDateStr || !endDateStr) {
        return res.status(400).json({ message: "startDate and endDate are required" });
      }
      
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      const topServices = await storage.getTopServices(startDate, endDate, limit);
      res.json(topServices);
    } catch (err) {
      res.status(500).json({ message: "Failed to retrieve top services" });
    }
  });

  // Set up the API routes with the /api prefix
  app.use("/api", api);

  const httpServer = createServer(app);
  return httpServer;
}
