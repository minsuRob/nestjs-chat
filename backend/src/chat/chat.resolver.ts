import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  Subscription,
} from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { RedisService } from '../redis/redis.service';
import { SendMessageInput } from './dto/send-message.input';
import { Message } from './entities/message.entity';

@Resolver(() => Message)
export class ChatResolver {
  constructor(
    private readonly chatService: ChatService,
    private readonly redisService: RedisService,
  ) {}

  @Query(() => [Message], { name: 'messages' })
  async getMessages(
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 50 })
    limit: number,
  ): Promise<Message[]> {
    return this.chatService.getMessages(limit);
  }

  @Mutation(() => Message)
  async sendMessage(@Args('input') input: SendMessageInput): Promise<Message> {
    return this.chatService.sendMessage(input);
  }

  @Subscription(() => Message, {
    name: 'messageAdded',
    resolve: (payload: {
      messageAdded: Message & { createdAt: Date | string };
    }) => {
      const { createdAt } = payload.messageAdded;
      const normalizedCreatedAt =
        createdAt instanceof Date
          ? createdAt
          : createdAt
          ? new Date(createdAt)
          : createdAt;

      return {
        ...payload.messageAdded,
        // Redis serializes dates into strings, so convert back before GraphQL serializes.
        createdAt: normalizedCreatedAt,
      };
    },
  })
  messageAdded() {
    const pubSub = this.redisService.getPubSub();
    return pubSub.asyncIterator('messageAdded');
  }
}
