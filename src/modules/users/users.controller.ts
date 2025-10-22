import {Controller, UseGuards} from '@nestjs/common';
import {UsersService} from './users.service';
import {AuthGuard} from '../auth/guard/auth.guard';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {
    }

}
