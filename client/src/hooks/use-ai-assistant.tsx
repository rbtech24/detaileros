import { useState } from "react";

type AiAssistantState = {
  isOpen: boolean;
  isLoading: boolean;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
};

type AiAssistantActions = {
  openAssistant: () => void;
  closeAssistant: () => void;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
};

// This is a simple mock implementation of AI assistant
// In a real application, this would connect to an AI API
export function useAiAssistant(): AiAssistantState & AiAssistantActions {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{
    role: "user" | "assistant";
    content: string;
  }>>([
    {
      role: "assistant",
      content: "Hello! I'm DetailPro AI. How can I help you with your auto detailing business today?",
    },
  ]);

  const openAssistant = () => setIsOpen(true);
  const closeAssistant = () => setIsOpen(false);
  const clearMessages = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hello! I'm DetailPro AI. How can I help you with your auto detailing business today?",
      },
    ]);
  };

  const sendMessage = async (message: string) => {
    // Add user message
    setMessages((prev) => [
      ...prev,
      { role: "user", content: message },
    ]);

    setIsLoading(true);

    try {
      // Simulate AI response delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Add mock AI response based on user message
      let response = "I don't have a specific response for that query. Could you try asking something about scheduling, customer management, or invoicing?";

      if (message.toLowerCase().includes("schedule") || message.toLowerCase().includes("appointment")) {
        response = "I can help you schedule appointments. To create a new appointment, go to the Calendar page and click on the 'New Job' button. You can select a customer, vehicle, service type, and preferred time slot.";
      } else if (message.toLowerCase().includes("customer") || message.toLowerCase().includes("client")) {
        response = "To manage customers, visit the Customers page where you can add new customers, view customer history, and manage their vehicles. Each customer profile includes contact information and service history.";
      } else if (message.toLowerCase().includes("invoice") || message.toLowerCase().includes("payment")) {
        response = "You can create and manage invoices from the Invoices page. After completing a job, you can generate an invoice that includes all services performed, applicable taxes, and payment options for your customer.";
      } else if (message.toLowerCase().includes("report") || message.toLowerCase().includes("revenue")) {
        response = "For business insights, check the Reports page. You'll find revenue breakdowns, service popularity stats, and customer retention metrics to help you analyze your business performance.";
      }

      // Add AI response
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    } catch (error) {
      console.error("AI assistant error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error processing your request." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isOpen,
    isLoading,
    messages,
    openAssistant,
    closeAssistant,
    sendMessage,
    clearMessages,
  };
}
