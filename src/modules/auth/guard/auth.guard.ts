import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private reflector: Reflector, private jwtService: JwtService) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException(`Token is required`);
    }

    const roles = this.reflector.getAllAndOverride<string[]>(Roles, [
      context.getHandler(),
      context.getClass(),
    ]);
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const role = payload.role?.toUpperCase();
      if (!roles || roles.length === 0 || roles.includes(role)) {
        request['connectedUser'] = payload;
        return true;
      }
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }

    throw new ForbiddenException(`You do not have permission to access this resource`);
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') || [];
    return type === 'Bearer' ? token : undefined;
  }

}