# Design Document

## Overview

GraphQL WebSocket/Subscription을 활용한 실시간 채팅 애플리케이션입니다. 백엔드는 NestJS로 구현하고, 프론트엔드는 Next.js로 구현합니다. PostgreSQL과 Prisma를 사용하여 메시지를 영구 저장하고, Redis를 통해 실시간 메시지 브로드캐스팅을 처리합니다.

## Architecture

### System Architecture

```mermaid
graph TB
    Client[Next.js Client]
    Gateway[NestJS GraphQL Gateway]
    ChatService[Chat Service]
    PrismaService[Prisma Service]
    RedisService[Redis PubSub]
    PostgreSQL[(PostgreSQL)]
    Redis[(Redis)]

    Client -->|GraphQL Query/Mutation| Gateway
    Client -->|WebSocket Subscription| Gateway
    Gateway --> ChatService
    ChatService --> PrismaService
    ChatService --> RedisService
    PrismaService --> PostgreSQL
    RedisService --> Redis
```

### Technology Stack

**Backend (NestJS)**

- @nestjs/graphql - GraphQL 서버 구현
- @nestjs/apollo - Apollo Server 통합
- @apollo/server - GraphQL 서버
- graphql-subscriptions - Subscription 구현
- @prisma/client - Database ORM
- ioredis - Redis 클라이언트
- class-validator - 입력 검증

**Frontend (Next.js)**

- @apollo/client - GraphQL 클라이언트
- graphql-ws - WebSocket 클라이언트
- React - UI 라이브러리

**Infrastructure**

- PostgreSQL - 메시지 영구 저장
- Redis - PubSub 및 세션 관리

## Components and Interfaces

### Backend Structure

```
backend/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── chat/
│   │   ├── chat.module.ts
│   │   ├── chat.resolver.ts
│   │   ├── chat.service.ts
│   │   ├── dto/
│   │   │   ├── send-message.input.ts
│   │   │   └── message.output.ts
│   │   └── entities/
│   │       └── message.entity.ts
│   ├── user/
│   │   ├── user.module.ts
│   │   ├── user.resolver.ts
│   │   ├── user.service.ts
│   │   └── dto/
│   │       ├── create-guest.input.ts
│   │       └── guest-user.output.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   └── redis/
│       ├── redis.module.ts
│       └── redis.service.ts
├── prisma/
│   └── schema.prisma
├── package.json
└── tsconfig.json
```

### Frontend Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ChatRoom.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageInput.tsx
│   │   └── GuestLogin.tsx
│   ├── graphql/
│   │   ├── queries.ts
│   │   ├── mutations.ts
│   │   └── subscriptions.ts
│   ├── lib/
│   │   └── apollo-client.ts
│   └── types/
│       └── chat.types.ts
├── package.json
└── tsconfig.json
```

## Data Models

### Prisma Schema

```prisma
model Message {
  id        String   @id @default(uuid())
  content   String
  nickname  String
  createdAt DateTime @default(now())

  @@index([createdAt])
}
```

### GraphQL Schema

```graphql
type Message {
  id: ID!
  content: String!
  nickname: String!
  createdAt: DateTime!
}

type GuestUser {
  nickname: String!
  sessionId: String!
}

input CreateGuestInput {
  nickname: String!
}

input SendMessageInput {
  content: String!
  nickname: String!
}

type Query {
  messages(limit: Int = 50): [Message!]!
}

type Mutation {
  createGuest(input: CreateGuestInput!): GuestUser!
  sendMessage(input: SendMessageInput!): Message!
}

type Subscription {
  messageAdded: Message!
}
```

### Redis Data Structures

**Active Users (Set)**

```
Key: chat:users:active
Value: Set of nicknames
TTL: Session-based
```

**User Sessions (Hash)**

```
Key: chat:session:{sessionId}
Fields: { nickname, connectedAt }
TTL: 24 hours
```

## Component Details

### Backend Components

#### ChatResolver

- GraphQL 엔드포인트 정의
- Query: `messages(limit: Int)` - 최근 메시지 조회
- Mutation: `sendMessage(input: SendMessageInput)` - 메시지 전송
- Subscription: `messageAdded` - 실시간 메시지 수신

#### ChatService

- 비즈니스 로직 처리
- 메시지 저장 및 조회
- Redis PubSub을 통한 메시지 브로드캐스팅
- 메시지 검증 (1-500자)

#### UserResolver

- Guest 사용자 관리
- Mutation: `createGuest(input: CreateGuestInput)` - Guest 생성

#### UserService

- 닉네임 중복 체크 및 고유화
- Redis에 활성 사용자 관리
- 세션 생성 및 관리

#### PrismaService

- Prisma Client 초기화 및 관리
- Database 연결 관리

#### RedisService

- Redis 연결 관리
- PubSub 인스턴스 제공
- 세션 및 캐시 관리

### Frontend Components

#### GuestLogin

- 닉네임 입력 폼
- `createGuest` mutation 호출
- 세션 정보를 로컬 스토리지에 저장

#### ChatRoom

- 전체 채팅 레이아웃 관리
- WebSocket 연결 상태 관리
- MessageList와 MessageInput 조합

#### MessageList

- 메시지 목록 표시
- `messages` query로 초기 메시지 로드
- `messageAdded` subscription으로 실시간 업데이트
- 자동 스크롤 기능

#### MessageInput

- 메시지 입력 폼
- `sendMessage` mutation 호출
- Enter 키로 전송

#### Apollo Client Setup

- HTTP Link: Query/Mutation 처리
- WebSocket Link: Subscription 처리
- Split Link: 요청 타입에 따라 링크 분기

## Error Handling

### Backend Error Handling

**Validation Errors**

- class-validator를 사용한 입력 검증
- GraphQL validation error로 반환
- 필드별 에러 메시지 제공

**Database Errors**

- Prisma 에러를 GraphQL 에러로 변환
- 연결 실패 시 재시도 로직
- 에러 로깅

**Redis Errors**

- 연결 실패 시 자동 재연결
- PubSub 실패 시 fallback 처리
- 에러 로깅

### Frontend Error Handling

**GraphQL Errors**

- Apollo Client error handling
- 사용자 친화적 에러 메시지 표시
- Toast 알림으로 에러 표시

**WebSocket Errors**

- 연결 끊김 감지
- 자동 재연결 시도
- 연결 상태 UI 표시

**Network Errors**

- 오프라인 감지
- 재시도 로직
- 사용자에게 상태 알림

## Testing Strategy

### Backend Testing

**Unit Tests**

- ChatService 메서드 테스트
- UserService 닉네임 고유화 로직 테스트
- Mock Prisma 및 Redis 사용

**Integration Tests**

- GraphQL resolver 테스트
- Database 연동 테스트
- Redis PubSub 테스트

### Frontend Testing

**Component Tests**

- React Testing Library 사용
- 각 컴포넌트 렌더링 테스트
- 사용자 인터랙션 테스트

**E2E Tests**

- Playwright 또는 Cypress 사용
- 전체 채팅 플로우 테스트
- 실시간 메시지 수신 테스트

## Performance Considerations

### Backend Optimization

**Database**

- createdAt 필드에 인덱스 추가
- 메시지 조회 시 LIMIT 사용
- Connection pooling 설정

**Redis**

- PubSub 채널 최적화
- 세션 데이터 TTL 설정
- 메모리 사용량 모니터링

**GraphQL**

- DataLoader 패턴 (필요시)
- Query complexity 제한
- Rate limiting (필요시)

### Frontend Optimization

**Rendering**

- 메시지 목록 가상화 (react-window)
- 메모이제이션 (React.memo)
- Lazy loading

**Network**

- WebSocket 연결 재사용
- 메시지 배치 처리
- Optimistic UI 업데이트

## Deployment Considerations

### Environment Variables

**Backend**

```
DATABASE_URL=postgresql://user:password@localhost:5432/chatdb
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=4000
```

**Frontend**

```
NEXT_PUBLIC_GRAPHQL_HTTP_URL=http://localhost:4000/graphql
NEXT_PUBLIC_GRAPHQL_WS_URL=ws://localhost:4000/graphql
```

### Docker Setup

- PostgreSQL 컨테이너
- Redis 컨테이너
- Backend 컨테이너
- Frontend 컨테이너
- docker-compose.yml로 통합 관리

## Security Considerations

**Input Validation**

- 모든 입력값 검증
- XSS 방지 (자동 이스케이핑)
- SQL Injection 방지 (Prisma 사용)

**Rate Limiting**

- 메시지 전송 빈도 제한
- WebSocket 연결 제한

**Data Sanitization**

- 사용자 입력 sanitize
- HTML 태그 제거 또는 이스케이핑

## Development Workflow

1. PostgreSQL 및 Redis 실행
2. Backend 개발 서버 실행 (`npm run start:dev`)
3. Prisma migration 실행 (`npx prisma migrate dev`)
4. Frontend 개발 서버 실행 (`npm run dev`)
5. GraphQL Playground에서 API 테스트 (http://localhost:4000/graphql)
