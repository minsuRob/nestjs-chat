# GraphQL Chat Application

GraphQL WebSocket/Subscription을 활용한 실시간 채팅 애플리케이션입니다.

## 기술 스택

### Backend

- NestJS
- GraphQL (Apollo Server)
- PostgreSQL
- Prisma
- Redis
- WebSocket (Subscriptions)

### Frontend

- Next.js
- Apollo Client
- TypeScript
- Tailwind CSS

## 시작하기

### 1. Docker 컨테이너 실행 (PostgreSQL, Redis)

```bash
docker-compose up -d
```

### 2. Backend 설정 및 실행

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

Backend는 http://localhost:4000 에서 실행됩니다.
GraphQL Playground: http://localhost:4000/graphql

### 3. Frontend 실행

```bash
cd frontend
npm install
npm run dev
```

Frontend는 http://localhost:3000 에서 실행됩니다.

## 프로젝트 구조

```
.
├── backend/          # NestJS 백엔드
│   ├── src/
│   │   ├── chat/     # 채팅 모듈
│   │   ├── user/     # 사용자 모듈
│   │   ├── prisma/   # Prisma 서비스
│   │   └── redis/    # Redis 서비스
│   └── prisma/       # Prisma 스키마
├── frontend/         # Next.js 프론트엔드
│   └── src/
│       ├── app/      # Next.js App Router
│       ├── components/ # React 컴포넌트
│       ├── graphql/  # GraphQL 쿼리/뮤테이션/구독
│       └── lib/      # Apollo Client 설정
└── docker-compose.yml
```

## 주요 기능

- Guest 사용자로 채팅 참여 (인증 불필요)
- 실시간 메시지 송수신 (GraphQL Subscription)
- 메시지 히스토리 조회
- Redis를 통한 메시지 브로드캐스팅
- PostgreSQL을 통한 메시지 영구 저장

## 개발 환경

- Node.js 22.x
- PostgreSQL 15
- Redis 7
