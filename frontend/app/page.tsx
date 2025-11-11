"use client";

import { useState, useEffect } from "react";
import { GuestLogin } from "@/components/GuestLogin";
import { ChatRoom } from "@/components/ChatRoom";
import type { GuestUser } from "@/types/chat.types";

export default function Home() {
  const [user, setUser] = useState<GuestUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("chatUser");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse saved user:", error);
        localStorage.removeItem("chatUser");
      }
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <GuestLogin onLogin={setUser} />;
  }

  return <ChatRoom user={user} />;
}
