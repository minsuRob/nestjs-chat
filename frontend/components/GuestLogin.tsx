"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_GUEST } from "@/graphql/mutations";
import type { GuestUser } from "@/types/chat.types";

interface GuestLoginProps {
  onLogin: (user: GuestUser) => void;
}

export function GuestLogin({ onLogin }: GuestLoginProps) {
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  const [createGuest, { loading }] = useMutation<{
    createGuest: GuestUser;
  }>(CREATE_GUEST, {
    onCompleted: (data) => {
      const user = data.createGuest;
      localStorage.setItem("chatUser", JSON.stringify(user));
      onLogin(user);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (nickname.length < 2 || nickname.length > 20) {
      setError("Nickname must be between 2 and 20 characters");
      return;
    }

    createGuest({
      variables: {
        input: { nickname },
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Join Chat
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="nickname"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter your nickname
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Your nickname"
              disabled={loading}
              autoFocus
            />
          </div>
          {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {loading ? "Joining..." : "Join Chat"}
          </button>
        </form>
      </div>
    </div>
  );
}
