import { gql } from "@apollo/client";

export const CREATE_GUEST = gql`
  mutation CreateGuest($input: CreateGuestInput!) {
    createGuest(input: $input) {
      nickname
      sessionId
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      content
      nickname
      createdAt
    }
  }
`;
