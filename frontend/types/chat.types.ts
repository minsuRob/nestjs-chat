export interface Message {
  id: string;
  content: string;
  nickname: string;
  createdAt: string;
}

export interface GuestUser {
  nickname: string;
  sessionId: string;
}

export interface CreateGuestInput {
  nickname: string;
}

export interface SendMessageInput {
  content: string;
  nickname: string;
}
