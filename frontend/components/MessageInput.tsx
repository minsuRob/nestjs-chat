"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { SEND_MESSAGE } from "@/graphql/mutations";
import type { Message } from "@/types/chat.types";

interface MessageInputProps {
  nickname: string;
}

export function MessageInput({ nickname }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const [sendMessage, { loading }] = useMutation<{ sendMessage: Message }>(
    SEND_MESSAGE,
    {
      onCompleted: () => {
        setContent("");
        setError("");
      },
      onError: (err) => {
        setError(err.message);
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      return;
    }

    if (content.length > 500) {
      setError("Message must be 500 characters or less");
      return;
    }

    sendMessage({
      variables: {
        input: {
          content: content.trim(),
          nickname,
        },
      },
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-300 p-4 bg-white">
      {error && <div className="mb-2 text-red-500 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900"
          rows={1}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
