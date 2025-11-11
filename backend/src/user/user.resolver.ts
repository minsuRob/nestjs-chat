import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { CreateGuestInput } from './dto/create-guest.input';
import { GuestUser } from './dto/guest-user.output';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => GuestUser)
  async createGuest(
    @Args('input') input: CreateGuestInput,
  ): Promise<GuestUser> {
    return this.userService.createGuest(input);
  }
}
