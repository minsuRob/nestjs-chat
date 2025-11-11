import { gql } from "@apollo/client";

export const GET_MESSAGES = gql`
  query GetMessages($limit: Int) {
    messages(limit: $limit) {
      id
      content
      nickname
      createdAt
    }
  }
`;
