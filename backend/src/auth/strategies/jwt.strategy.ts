import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

type JwtPayload = {
  sub: string | number;
  username: string;
  iat?: number;
  exp?: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is required');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

async validate(payload: JwtPayload) {
  const rawId = payload?.sub

  if (rawId === undefined || rawId === null) {
    throw new UnauthorizedException('Invalid token')
  }

  const userId = typeof rawId === 'string' ? Number(rawId) : rawId

  if (!Number.isFinite(userId)) {
    throw new UnauthorizedException('Invalid token')
  }

  const user = await this.authService.getUserById(userId)
  if (!user) {
    throw new UnauthorizedException('Invalid token')
  }

  return user // queda en req.user
}
}