import {useState, useCallback} from "react";
import {ChatMessage, ChatState, FormData} from "../types";

export function useChatState() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  const addMessage = useCallback(
    (message: Omit<ChatMessage, "id" | "timestamp">) => {
      const newMessage: ChatMessage = {
        ...message,
        id: Date.now().toString(),
        timestamp: new Date(),
      };

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, newMessage],
      }));
    },
    []
  );

  const updateFormData = useCallback((updatedFields: Partial<FormData>) => {
    setChatState((prev) => ({
      ...prev,
      messages: prev.messages.map((msg) =>
        msg.type === "assistant" && msg.metadata?.updatedFields
          ? {
              ...msg,
              metadata: {
                ...msg.metadata,
                updatedFields: {
                  ...msg.metadata.updatedFields,
                  ...updatedFields,
                },
              },
            }
          : msg
      ),
    }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setChatState((prev) => ({...prev, isLoading}));
  }, []);

  const setError = useCallback((error: string | null) => {
    setChatState((prev) => ({...prev, error}));
  }, []);

  const clearMessages = useCallback(() => {
    setChatState((prev) => ({...prev, messages: []}));
  }, []);

  return {
    chatState,
    addMessage,
    updateFormData,
    setLoading,
    setError,
    clearMessages,
  };
}
