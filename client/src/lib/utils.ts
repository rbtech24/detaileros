import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, formatString: string = "PP"): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatString);
}

export function formatTime(date: Date | string, formatString: string = "p"): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatString);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return "";
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, "");
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }
  
  return phoneNumber;
}

export function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function getStatusColor(status: string): {
  backgroundColor: string;
  textColor: string;
} {
  switch (status) {
    case "scheduled":
      return {
        backgroundColor: "bg-yellow-100",
        textColor: "text-yellow-800",
      };
    case "in_progress":
      return {
        backgroundColor: "bg-blue-100",
        textColor: "text-blue-800",
      };
    case "completed":
      return {
        backgroundColor: "bg-green-100",
        textColor: "text-green-800",
      };
    case "cancelled":
      return {
        backgroundColor: "bg-red-100",
        textColor: "text-red-800",
      };
    default:
      return {
        backgroundColor: "bg-slate-100",
        textColor: "text-slate-800",
      };
  }
}

export function generateTimeSlots(startHour: number = 8, endHour: number = 18, interval: number = 30) {
  const slots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const hourString = hour.toString().padStart(2, '0');
      const minuteString = minute.toString().padStart(2, '0');
      slots.push(`${hourString}:${minuteString}`);
    }
  }
  return slots;
}

export function generateInvoiceNumber(): string {
  const prefix = "INV";
  const randomDigits = Math.floor(10000 + Math.random() * 90000); // 5-digit number
  return `${prefix}-${randomDigits}`;
}

export function calculateTotalFromServices(services: {
  serviceId: number;
  price: number;
  quantity: number;
}[]): {
  subtotal: number;
  tax: number;
  total: number;
} {
  const taxRate = 0.0825; // 8.25%
  const subtotal = services.reduce((sum, service) => sum + service.price * service.quantity, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  
  return {
    subtotal,
    tax,
    total
  };
}

export function getDurationBetweenDates(startDate: Date, endDate: Date): number {
  return Math.round((endDate.getTime() - startDate.getTime()) / 60000); // duration in minutes
}

export function addMinutesToDate(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

export function isAvailable(
  startTime: Date,
  endTime: Date,
  existingAppointments: { start: Date; end: Date }[]
): boolean {
  for (const appointment of existingAppointments) {
    // Check if there's any overlap
    if (
      (startTime >= appointment.start && startTime < appointment.end) ||
      (endTime > appointment.start && endTime <= appointment.end) ||
      (startTime <= appointment.start && endTime >= appointment.end)
    ) {
      return false;
    }
  }
  return true;
}
