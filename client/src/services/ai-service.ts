import { apiRequest } from "@/lib/queryClient";

/**
 * Service for handling AI functionality in the application
 */
export const aiService = {
  /**
   * Send a message to the AI assistant and get a response
   */
  async sendMessage(question: string, context: string = ""): Promise<string> {
    try {
      const response = await apiRequest("POST", "/api/ai/assistant", {
        question,
        context
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("AI assistant error:", error);
      throw error;
    }
  },

  /**
   * Analyze customer feedback for sentiment and extract key points
   */
  async analyzeFeedback(feedback: string): Promise<{
    sentiment: "positive" | "neutral" | "negative";
    score: number;
    keyPoints: string[];
  }> {
    try {
      const response = await apiRequest("POST", "/api/ai/analyze-feedback", {
        feedback
      });

      if (!response.ok) {
        throw new Error("Failed to analyze feedback");
      }

      return await response.json();
    } catch (error) {
      console.error("Feedback analysis error:", error);
      throw error;
    }
  },

  /**
   * Generate an email draft for customer communication
   */
  async generateEmailDraft(
    customerName: string,
    purpose: "follow_up" | "appointment_reminder" | "invoice" | "thank_you" | "custom",
    customDetails: string = ""
  ): Promise<string> {
    try {
      const response = await apiRequest("POST", "/api/ai/email-draft", {
        customerName,
        purpose,
        customDetails
      });

      if (!response.ok) {
        throw new Error("Failed to generate email draft");
      }

      const data = await response.json();
      return data.emailDraft;
    } catch (error) {
      console.error("Email draft generation error:", error);
      throw error;
    }
  },

  /**
   * Generate a job estimate based on vehicle details and requested services
   */
  async generateJobEstimate(
    vehicleType: string,
    vehicleCondition: string,
    requestedServices: string[]
  ): Promise<{
    estimatedTime: number;
    recommendedServices: string[];
    note: string;
  }> {
    try {
      const response = await apiRequest("POST", "/api/ai/job-estimate", {
        vehicleType,
        vehicleCondition,
        requestedServices
      });

      if (!response.ok) {
        throw new Error("Failed to generate job estimate");
      }

      return await response.json();
    } catch (error) {
      console.error("Job estimate generation error:", error);
      throw error;
    }
  }
};