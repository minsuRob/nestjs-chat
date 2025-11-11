import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { CreateGuestInput } from './dto/create-guest.input';
import { GuestUser } from './dto/guest-user.output';
import { randomUUID } from 'crypto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly ACTIVE_USERS_KEY = 'chat:users:active';
  private readonly SESSION_PREFIX = 'chat:session:';
  private readonly SESSION_TTL = 86400; // 24 hours

  constructor(private readonly redisService: RedisService) {}

  async createGuest(input: CreateGuestInput): Promise<GuestUser> {
    let nickname = input.nickname;

    // Check if nickname is already in use and make it unique
    const isInUse = await this.redisService.sismember(
      this.ACTIVE_USERS_KEY,
      nickname,
    );

    if (isInUse) {
      nickname = await this.makeNicknameUnique(nickname);
    }

    // Generate session ID
    const sessionId = randomUUID();

    // Store user in active users set
    await this.redisService.sadd(this.ACTIVE_USERS_KEY, nickname);

    // Store session information
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
    await this.redisService.hset(sessionKey, 'nickname', nickname);
    await this.redisService.hset(
      sessionKey,
      'connectedAt',
      new Date().toISOString(),
    );
    await this.redisService.expire(sessionKey, this.SESSION_TTL);

    this.logger.log(`Guest user created: ${nickname} (${sessionId})`);

    return {
      nickname,
      sessionId,
    };
  }

  private async makeNicknameUnique(baseNickname: string): Promise<string> {
    let counter = 1;
    let uniqueNickname = `${baseNickname}${counter}`;

    while (
      await this.redisService.sismember(this.ACTIVE_USERS_KEY, uniqueNickname)
    ) {
      counter++;
      uniqueNickname = `${baseNickname}${counter}`;
    }

    return uniqueNickname;
  }

  async removeGuest(sessionId: string): Promise<void> {
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
    const sessionData = await this.redisService.hgetall(sessionKey);

    if (sessionData.nickname) {
      await this.redisService.srem(this.ACTIVE_USERS_KEY, sessionData.nickname);
      await this.redisService.del(sessionKey);
      this.logger.log(`Guest user removed: ${sessionData.nickname}`);
    }
  }
}
