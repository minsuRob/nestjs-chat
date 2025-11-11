import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class GuestUser {
  @Field()
  nickname: string;

  @Field()
  sessionId: string;
}
