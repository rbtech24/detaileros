import React, { useState, useRef, useEffect } from "react";
import { useAiAssistant } from "@/hooks/use-ai-assistant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send, X, MessageSquare } from "lucide-react";

export function AiAssistant() {
  const {
    isOpen,
    isLoading,
    messages,
    openAssistant,
    closeAssistant,
    sendMessage,
    clearMessages,
  } = useAiAssistant();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when assistant opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    await sendMessage(input);
    setInput("");
  };

  if (!isOpen) {
    return (
      <Button
        onClick={openAssistant}
        className="fixed bottom-4 right-4 rounded-full h-12 w-12 p-0 shadow-lg flex items-center justify-center"
        aria-label="Open AI Assistant"
      >
        <MessageSquare size={24} />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 md:w-96 h-[500px] shadow-xl flex flex-col z-50">
      <CardHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-md font-medium">DetailerOps Assistant</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={clearMessages}
            className="h-8 w-8"
            aria-label="Clear chat"
          >
            <Loader2 size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeAssistant}
            className="h-8 w-8"
            aria-label="Close assistant"
          >
            <X size={18} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 overflow-hidden">
        <ScrollArea className="h-[370px] pr-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "assistant" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.role === "assistant"
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-3 py-2 bg-muted">
                  <div className="flex items-center space-x-2">
                    <Loader2 size={16} className="animate-spin" />
                    <p className="text-sm">Thinking...</p>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-3 pt-0">
        <form onSubmit={handleSubmit} className="flex w-full space-x-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}