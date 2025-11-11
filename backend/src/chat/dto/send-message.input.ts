import { InputType, Field } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';

@InputType()
export class SendMessageInput {
  @Field()
  @IsString()
  @Length(1, 500, { message: 'Message must be between 1 and 500 characters' })
  content: string;

  @Field()
  @IsString()
  nickname: string;
}
