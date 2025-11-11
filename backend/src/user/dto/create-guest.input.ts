import { InputType, Field } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';

@InputType()
export class CreateGuestInput {
  @Field()
  @IsString()
  @Length(2, 20, { message: 'Nickname must be between 2 and 20 characters' })
  nickname: string;
}
