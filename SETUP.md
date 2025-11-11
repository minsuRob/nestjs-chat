# 프로젝트 실행 가이드

## 사전 준비사항

1. **Docker Desktop 설치 및 실행**

   - Docker Desktop이 설치되어 있어야 합니다
   - Docker Desktop을 실행하여 Docker daemon이 작동 중인지 확인하세요
   - 확인 방법: `docker ps` 명령어가 정상 작동하는지 확인

2. **Node.js 설치**
   - Node.js 22.x 이상 권장

## 실행 순서

### 1단계: Docker 컨테이너 실행

```bash
# Docker Desktop이 실행 중인지 확인
docker ps

# PostgreSQL과 Redis 컨테이너 실행
docker-compose up -d

# 컨테이너 상태 확인
docker ps
# chat-postgres와 chat-redis가 실행 중이어야 합니다
```

### 2단계: Backend 설정 및 실행

```bash
cd backend

# Prisma Client 생성
npx prisma generate

# 데이터베이스 마이그레이션 실행
npx prisma migrate dev --name init

# 개발 서버 실행
npm run start:dev
```

**Backend 실행 확인:**

- 터미널에 "🚀 Server is running on http://localhost:4000/graphql" 메시지가 표시되어야 합니다
- http://localhost:4000/graphql 에서 GraphQL Playground 접속 가능

### 3단계: Frontend 실행 (새 터미널)

```bash
cd frontend

# 개발 서버 실행
npm run dev
```

**Frontend 실행 확인:**

- http://localhost:3000 에서 채팅 애플리케이션 접속 가능

## 문제 해결

### 1. Docker 연결 오류

```
Error: Cannot connect to the Docker daemon
```

**해결 방법:**

- Docker Desktop을 실행하세요
- macOS: Applications에서 Docker.app 실행
- 시스템 트레이에 Docker 아이콘이 표시되고 "Docker Desktop is running" 상태인지 확인

### 2. 데이터베이스 접근 오류

```
Error: P1010: User was denied access on the database
```

**해결 방법:**

- Docker 컨테이너가 실행 중인지 확인: `docker ps`
- PostgreSQL 컨테이너 로그 확인: `docker logs chat-postgres`
- 컨테이너 재시작: `docker-compose restart postgres`

### 3. Redis 연결 오류

**해결 방법:**

- Redis 컨테이너가 실행 중인지 확인: `docker ps`
- Redis 컨테이너 로그 확인: `docker logs chat-redis`
- 컨테이너 재시작: `docker-compose restart redis`

### 4. 포트 충돌

**Backend (4000 포트):**

```bash
# 4000 포트를 사용 중인 프로세스 확인
lsof -i :4000

# 프로세스 종료
kill -9 <PID>
```

**Frontend (3000 포트):**

```bash
# 3000 포트를 사용 중인 프로세스 확인
lsof -i :3000

# 프로세스 종료
kill -9 <PID>
```

## 테스트 방법

1. **Guest 로그인 테스트**

   - http://localhost:3000 접속
   - 닉네임 입력 (2-20자)
   - "Join Chat" 버튼 클릭

2. **메시지 전송 테스트**

   - 메시지 입력 후 "Send" 버튼 클릭
   - 또는 Enter 키로 전송

3. **실시간 채팅 테스트**

   - 다른 브라우저 탭 또는 시크릿 모드로 http://localhost:3000 접속
   - 다른 닉네임으로 로그인
   - 양쪽에서 메시지를 주고받으며 실시간 동기화 확인

4. **GraphQL Playground 테스트**
   - http://localhost:4000/graphql 접속
   - 다음 쿼리 실행:

```graphql
# Guest 생성
mutation {
  createGuest(input: { nickname: "TestUser" }) {
    nickname
    sessionId
  }
}

# 메시지 전송
mutation {
  sendMessage(input: { content: "Hello!", nickname: "TestUser" }) {
    id
    content
    nickname
    createdAt
  }
}

# 메시지 조회
query {
  messages(limit: 10) {
    id
    content
    nickname
    createdAt
  }
}

# 실시간 메시지 구독
subscription {
  messageAdded {
    id
    content
    nickname
    createdAt
  }
}
```

## 환경 변수

### Backend (.env)

```env
DATABASE_URL="postgresql://chatuser:chatpass@localhost:5432/chatdb?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=4000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_GRAPHQL_HTTP_URL=http://localhost:4000/graphql
NEXT_PUBLIC_GRAPHQL_WS_URL=ws://localhost:4000/graphql
```

## 종료 방법

```bash
# Backend 종료: Ctrl + C

# Frontend 종료: Ctrl + C

# Docker 컨테이너 종료
docker-compose down

# Docker 컨테이너 및 볼륨 삭제 (데이터 초기화)
docker-compose down -v
```

## 데이터베이스 초기화

```bash
# 컨테이너 및 볼륨 삭제
docker-compose down -v

# 컨테이너 재시작
docker-compose up -d

# 마이그레이션 재실행
cd backend
npx prisma migrate dev --name init
```
