import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { aiService } from "@/services/ai-service";

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

export function useAiAssistant(): AiAssistantState & AiAssistantActions {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{
    role: "user" | "assistant";
    content: string;
  }>>([
    {
      role: "assistant",
      content: "Hello! I'm DetailerOps AI. How can I help you with your auto detailing business today?",
    },
  ]);

  const openAssistant = () => setIsOpen(true);
  const closeAssistant = () => setIsOpen(false);
  const clearMessages = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hello! I'm DetailerOps AI. How can I help you with your auto detailing business today?",
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
      // Get context from previous messages to provide continuity
      const previousMessages = messages
        .slice(-4) // Last 4 messages for context
        .map(msg => `${msg.role}: ${msg.content}`)
        .join("\n");

      // Call the AI assistant service
      const aiResponse = await aiService.sendMessage(message, previousMessages);

      // Add AI response
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiResponse },
      ]);
    } catch (error) {
      console.error("AI assistant error:", error);
      toast({
        title: "AI Assistant Error",
        description: "There was a problem connecting to the AI service. Please try again.",
        variant: "destructive"
      });
      
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: "Sorry, I encountered an error processing your request. Please try again in a moment." 
        },
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
