"use client";

import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import type { GuestUser } from "@/types/chat.types";

interface ChatRoomProps {
  user: GuestUser;
}

export function ChatRoom({ user }: ChatRoomProps) {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-blue-500 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">GraphQL Chat</h1>
          <div className="text-sm">
            Logged in as: <span className="font-semibold">{user.nickname}</span>
          </div>
        </div>
      </header>
      <div className="flex-1 flex flex-col overflow-hidden">
        <MessageList currentNickname={user.nickname} />
        <MessageInput nickname={user.nickname} />
      </div>
    </div>
  );
}
