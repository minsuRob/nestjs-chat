# 데이터베이스 마이그레이션 가이드

## 현재 상태

✅ 초기 마이그레이션 완료
✅ Message 테이블 생성 완료
✅ Prisma Client 생성 완료

## 일반적인 사용 (마이그레이션 이미 완료됨)

프로젝트를 처음 클론하거나 데이터베이스를 초기화한 경우:

```bash
# 1. Docker 컨테이너 실행
docker-compose up -d

# 2. Prisma Client 생성
npx prisma generate

# 3. 서버 실행
npm run start:dev
```

**마이그레이션은 이미 완료되었으므로 다시 실행할 필요가 없습니다!**

## 스키마 변경 시 (새로운 모델 추가 등)

### 방법 1: prisma db push (개발 환경 권장)

```bash
# 스키마 변경 후
npx prisma db push

# Prisma Client 재생성
npx prisma generate
```

`prisma db push`는:

- 마이그레이션 파일을 생성하지 않음
- 개발 중 빠른 프로토타이핑에 적합
- 스키마를 데이터베이스에 직접 동기화

### 방법 2: 수동 마이그레이션 (프로덕션 권장)

Prisma migrate에 문제가 있는 경우, 수동으로 마이그레이션을 생성하고 적용할 수 있습니다:

```bash
# 1. 마이그레이션 SQL 파일 생성
mkdir -p prisma/migrations/$(date +%Y%m%d%H%M%S)_your_migration_name

# 2. SQL 파일 작성
# prisma/migrations/YYYYMMDDHHMMSS_your_migration_name/migration.sql

# 3. SQL 실행
docker exec -i chat-postgres psql -U chatuser -d chatdb < prisma/migrations/YYYYMMDDHHMMSS_your_migration_name/migration.sql

# 4. Prisma Client 재생성
npx prisma generate
```

## 데이터베이스 초기화 (모든 데이터 삭제)

```bash
# 1. 컨테이너 및 볼륨 삭제
docker-compose down -v

# 2. 컨테이너 재시작
docker-compose up -d

# 3. Shadow database 생성
docker exec chat-postgres psql -U chatuser -d postgres -c "CREATE DATABASE chatdb_shadow OWNER chatuser;"

# 4. 마이그레이션 SQL 실행
docker exec -i chat-postgres psql -U chatuser -d chatdb < prisma/migrations/20241111000000_init/migration.sql

# 5. Prisma migrations 테이블 생성 및 기록
docker exec chat-postgres psql -U chatuser -d chatdb -c "CREATE TABLE IF NOT EXISTS \"_prisma_migrations\" (
    id VARCHAR(36) PRIMARY KEY,
    checksum VARCHAR(64) NOT NULL,
    finished_at TIMESTAMPTZ,
    migration_name VARCHAR(255) NOT NULL,
    logs TEXT,
    rolled_back_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    applied_steps_count INTEGER NOT NULL DEFAULT 0
);"

docker exec chat-postgres psql -U chatuser -d chatdb -c "INSERT INTO \"_prisma_migrations\" (id, checksum, migration_name, logs, started_at, finished_at, applied_steps_count) VALUES (
    '$(uuidgen)',
    '$(echo -n "20241111000000_init" | md5)',
    '20241111000000_init',
    '',
    now(),
    now(),
    1
);"

# 6. Prisma Client 생성
npx prisma generate
```

## 테이블 확인

```bash
# 현재 테이블 목록 확인
docker exec chat-postgres psql -U chatuser -d chatdb -c "\dt"

# Message 테이블 구조 확인
docker exec chat-postgres psql -U chatuser -d chatdb -c "\d Message"

# 마이그레이션 기록 확인
docker exec chat-postgres psql -U chatuser -d chatdb -c "SELECT * FROM _prisma_migrations;"
```

## Prisma Studio (데이터베이스 GUI)

```bash
# Prisma Studio 실행
npx prisma studio

# 브라우저에서 http://localhost:5555 접속
```

## 문제 해결

### "User was denied access" 오류

이 오류는 Prisma의 shadow database 접근 권한 문제입니다. 해결 방법:

1. **prisma db push 사용** (권장)

   ```bash
   npx prisma db push
   ```

2. **수동 마이그레이션** (위의 "방법 2" 참조)

### 마이그레이션 상태 불일치

```bash
# 현재 마이그레이션 상태 확인
docker exec chat-postgres psql -U chatuser -d chatdb -c "SELECT * FROM _prisma_migrations;"

# 필요시 마이그레이션 기록 삭제 후 재적용
docker exec chat-postgres psql -U chatuser -d chatdb -c "DELETE FROM _prisma_migrations WHERE migration_name = 'your_migration_name';"
```

## 예제: 새 모델 추가

1. `prisma/schema.prisma`에 새 모델 추가:

```prisma
model User {
  id        String   @id @default(uuid())
  username  String   @unique
  createdAt DateTime @default(now())
}
```

2. 데이터베이스에 적용:

```bash
npx prisma db push
```

3. Prisma Client 재생성 (자동으로 실행되지만 명시적으로 실행 가능):

```bash
npx prisma generate
```

4. 서버 재시작:

```bash
npm run start:dev
```
