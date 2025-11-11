"use client";

import { useEffect, useRef } from "react";
import { useQuery, useSubscription } from "@apollo/client/react";
import { GET_MESSAGES } from "@/graphql/queries";
import { MESSAGE_ADDED } from "@/graphql/subscriptions";
import type { Message } from "@/types/chat.types";

interface MessageListProps {
  currentNickname: string;
}

export function MessageList({ currentNickname }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data, loading, error } = useQuery<{ messages: Message[] }>(
    GET_MESSAGES,
    {
      variables: { limit: 50 },
    }
  );

  useSubscription<{ messageAdded: Message }>(MESSAGE_ADDED, {
    onData: ({ client, data: subscriptionData }) => {
      if (subscriptionData.data?.messageAdded) {
        const newMessage = subscriptionData.data.messageAdded;

        // Update cache with new message
        client.cache.updateQuery<{ messages: Message[] }>(
          { query: GET_MESSAGES, variables: { limit: 50 } },
          (existingData) => {
            if (!existingData) return { messages: [newMessage] };

            // Check if message already exists to avoid duplicates
            const messageExists = existingData.messages.some(
              (msg) => msg.id === newMessage.id
            );

            if (messageExists) return existingData;

            return {
              messages: [...existingData.messages, newMessage],
            };
          }
        );
      }
    },
  });

  const messages = data?.messages || [];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-red-500">
          Error loading messages: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isCurrentUser = message.nickname === currentNickname;
        return (
          <div
            key={message.id}
            className={`flex ${
              isCurrentUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                isCurrentUser
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-semibold text-sm">
                  {message.nickname}
                </span>
                <span
                  className={`text-xs ${
                    isCurrentUser ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {formatTime(message.createdAt)}
                </span>
              </div>
              <div className="break-words">{message.content}</div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
