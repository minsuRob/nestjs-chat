# Implementation Plan

- [x] 1. 프로젝트 초기 설정 및 의존성 설치

  - Backend와 Frontend 디렉토리 생성
  - NestJS 프로젝트 초기화 (backend/)
  - Next.js 프로젝트 초기화 (frontend/)
  - 필요한 npm 패키지 설치 (GraphQL, Prisma, Redis, Apollo 등)
  - Docker Compose 파일 작성 (PostgreSQL, Redis)
  - _Requirements: 6.4, 6.5_

- [x] 2. Backend - Prisma 및 데이터베이스 설정

  - Prisma 스키마 파일 작성 (Message 모델)
  - Prisma Client 생성
  - PrismaService 및 PrismaModule 구현
  - 초기 마이그레이션 생성 및 실행
  - _Requirements: 6.4, 2.2_

- [x] 3. Backend - Redis 설정 및 PubSub 구현

  - RedisService 구현 (ioredis 클라이언트)
  - RedisModule 구현
  - PubSub 인스턴스 생성 및 제공
  - Redis 연결 에러 핸들링 및 재연결 로직
  - _Requirements: 6.5, 7.2_

- [x] 4. Backend - GraphQL 서버 설정

  - AppModule에 GraphQL 모듈 설정
  - Apollo Server 설정 (HTTP 및 WebSocket)
  - GraphQL Playground 활성화
  - Subscription transport 설정
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 5. Backend - User 모듈 구현

  - UserModule, UserResolver, UserService 생성
  - CreateGuestInput DTO 작성 (닉네임 검증 2-20자)
  - GuestUser 출력 타입 정의
  - createGuest mutation 구현
  - 닉네임 중복 체크 및 고유화 로직 (숫자 suffix 추가)
  - Redis에 활성 사용자 저장 및 세션 관리
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 6. Backend - Chat 모듈 기본 구조 구현

  - ChatModule, ChatResolver, ChatService 생성
  - SendMessageInput DTO 작성 (메시지 검증 1-500자)
  - Message 엔티티 및 출력 타입 정의
  - ChatModule에 Prisma 및 Redis 의존성 주입
  - _Requirements: 2.1, 2.4, 6.1, 6.2_

- [ ] 7. Backend - 메시지 전송 기능 구현

  - sendMessage mutation 구현
  - 메시지 검증 로직 (1-500자)
  - Prisma를 통한 메시지 저장 (닉네임, 내용, 타임스탬프)
  - Redis PubSub으로 메시지 발행
  - 에러 핸들링 (저장 실패 시 에러 반환)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 7.1_

- [ ] 8. Backend - 메시지 조회 기능 구현

  - messages query 구현
  - Prisma를 통한 최근 50개 메시지 조회
  - createdAt 기준 오름차순 정렬
  - limit 파라미터 처리 (기본값 50)
  - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [ ] 9. Backend - 실시간 메시지 Subscription 구현

  - messageAdded subscription 구현
  - Redis PubSub 구독 설정
  - 새 메시지 브로드캐스팅
  - WebSocket 연결 관리
  - _Requirements: 3.1, 3.2, 3.5, 6.3_

- [ ] 10. Backend - 에러 핸들링 및 로깅

  - GraphQL 에러 포맷팅
  - Validation 에러 처리
  - Database 에러 처리 및 로깅
  - Redis 에러 처리 및 로깅
  - 에러 메시지 표준화
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [ ] 11. Frontend - Apollo Client 설정

  - Apollo Client 인스턴스 생성
  - HTTP Link 설정 (Query/Mutation)
  - WebSocket Link 설정 (Subscription)
  - Split Link로 요청 타입별 라우팅
  - ApolloProvider로 앱 래핑
  - _Requirements: 3.1, 6.1, 6.2, 6.3_

- [ ] 12. Frontend - GraphQL 쿼리/뮤테이션/구독 정의

  - messages query 정의
  - createGuest mutation 정의
  - sendMessage mutation 정의
  - messageAdded subscription 정의
  - TypeScript 타입 정의
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 13. Frontend - GuestLogin 컴포넌트 구현

  - 닉네임 입력 폼 UI
  - createGuest mutation 호출
  - 세션 정보 로컬 스토리지 저장
  - 에러 처리 및 표시
  - _Requirements: 1.1, 1.2, 7.4_

- [ ] 14. Frontend - MessageList 컴포넌트 구현

  - 메시지 목록 UI (스크롤 가능 영역)
  - messages query로 초기 메시지 로드
  - messageAdded subscription으로 실시간 업데이트
  - 메시지 표시 (닉네임, 내용, 타임스탬프)
  - 자동 스크롤 기능 (새 메시지 도착 시)
  - 현재 사용자 메시지 구분 표시
  - _Requirements: 3.2, 3.3, 4.1, 4.2, 4.3, 5.2, 5.3, 5.4, 5.5_

- [ ] 15. Frontend - MessageInput 컴포넌트 구현

  - 메시지 입력 폼 UI (하단 고정)
  - sendMessage mutation 호출
  - Enter 키로 전송 기능
  - 전송 후 입력 필드 초기화
  - 에러 처리 및 표시
  - _Requirements: 2.1, 5.1, 7.4_

- [ ] 16. Frontend - ChatRoom 컴포넌트 통합

  - 전체 채팅 레이아웃 구성
  - MessageList와 MessageInput 조합
  - WebSocket 연결 상태 관리
  - 연결 상태 UI 표시
  - 자동 재연결 처리
  - _Requirements: 3.1, 3.4, 5.1, 5.2_

- [ ] 17. Frontend - 에러 핸들링 및 사용자 피드백

  - Apollo Client 에러 핸들링 설정
  - Toast 알림 컴포넌트 구현
  - GraphQL 에러 표시
  - WebSocket 연결 에러 표시
  - 네트워크 에러 처리
  - _Requirements: 7.4_

- [ ] 18. 통합 테스트 및 최종 검증
  - Docker Compose로 전체 스택 실행
  - 여러 브라우저 탭에서 동시 접속 테스트
  - 메시지 전송 및 실시간 수신 확인
  - WebSocket 재연결 테스트
  - 에러 시나리오 테스트
  - _Requirements: 3.2, 3.4, 3.5_
