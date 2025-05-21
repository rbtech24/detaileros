import OpenAI from "openai";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Send a question to the AI assistant and get a response
 */
export async function askAssistant(question: string, context: string = ""): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system", 
          content: `You are an AI assistant for DetailerOps, an auto detailing business management system. 
          Provide helpful, concise answers to questions about auto detailing, business management, scheduling, 
          customer service, and using the DetailerOps system.
          ${context ? `\n\nContextual information: ${context}` : ""}`
        },
        { role: "user", content: question }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Error in AI assistant:", error);
    return "I'm sorry, there was an error processing your request. Please try again later.";
  }
}

/**
 * Analyze customer feedback for sentiment and extract key points
 */
export async function analyzeFeedback(feedback: string): Promise<{
  sentiment: "positive" | "neutral" | "negative";
  score: number;
  keyPoints: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze the sentiment of the customer feedback and extract key points. Return a JSON object with 'sentiment' (positive, neutral, or negative), 'score' (0-10), and 'keyPoints' (array of strings)."
        },
        { role: "user", content: feedback }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      sentiment: result.sentiment,
      score: result.score,
      keyPoints: result.keyPoints
    };
  } catch (error) {
    console.error("Error analyzing feedback:", error);
    return {
      sentiment: "neutral",
      score: 5,
      keyPoints: ["Unable to analyze feedback due to an error"]
    };
  }
}

/**
 * Generate a personalized email draft for customer communication
 */
export async function generateEmailDraft(
  customerName: string,
  purpose: "follow_up" | "appointment_reminder" | "invoice" | "thank_you" | "custom",
  customDetails: string = ""
): Promise<string> {
  try {
    const purposeContext = {
      follow_up: "a follow-up email after service completion",
      appointment_reminder: "a reminder about an upcoming appointment",
      invoice: "notification about a new invoice",
      thank_you: "a thank you message for being a customer",
      custom: "a custom message with specific details"
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Generate a professional, friendly email draft for ${purposeContext[purpose]}. 
          The email should be concise, warm, and represent an auto detailing business well.`
        },
        {
          role: "user",
          content: `Write an email to ${customerName}. ${customDetails}`
        }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content || "Unable to generate email draft";
  } catch (error) {
    console.error("Error generating email:", error);
    return "Error generating email draft. Please try again later.";
  }
}

/**
 * Generate a detailed job estimate based on vehicle type and requested services
 */
export async function generateJobEstimate(
  vehicleType: string,
  vehicleCondition: string,
  requestedServices: string[]
): Promise<{
  estimatedTime: number; // in hours
  recommendedServices: string[];
  note: string;
}> {
  try {
    const servicesString = requestedServices.join(", ");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert auto detailer with years of experience. 
          Generate a detailed job estimate for the given vehicle and services. 
          Return a JSON object with 'estimatedTime' (in hours, number), 
          'recommendedServices' (array of strings for additional recommended services), 
          and 'note' (string with special considerations).`
        },
        {
          role: "user",
          content: `Vehicle: ${vehicleType}
          Condition: ${vehicleCondition}
          Requested Services: ${servicesString}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      estimatedTime: result.estimatedTime,
      recommendedServices: result.recommendedServices,
      note: result.note
    };
  } catch (error) {
    console.error("Error generating job estimate:", error);
    return {
      estimatedTime: 2,
      recommendedServices: [],
      note: "Error generating detailed estimate. Please review manually."
    };
  }
}