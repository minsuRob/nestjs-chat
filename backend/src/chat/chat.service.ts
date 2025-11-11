import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SendMessageInput } from './dto/send-message.input';
import { Message } from './entities/message.entity';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async getMessages(limit: number = 50): Promise<Message[]> {
    const messages = await this.prismaService.message.findMany({
      take: limit,
      orderBy: {
        createdAt: 'asc',
      },
    });

    return messages;
  }

  async sendMessage(input: SendMessageInput): Promise<Message> {
    try {
      const message = await this.prismaService.message.create({
        data: {
          content: input.content,
          nickname: input.nickname,
        },
      });

      // Publish message to Redis PubSub
      const pubSub = this.redisService.getPubSub();
      await pubSub.publish('messageAdded', { messageAdded: message });

      this.logger.log(`Message sent by ${input.nickname}: ${input.content}`);

      return message;
    } catch (error) {
      this.logger.error('Failed to send message:', error);
      throw error;
    }
  }
}
