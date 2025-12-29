import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'secretKey',
            passReqToCallback: true,
        });
    }

    async validate(req: any, payload: any) {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        if (token && this.authService.isTokenRevoked(token)) {
            throw new UnauthorizedException('Token is revoked');
        }

        const user = await this.authService.getUserById(payload.sub);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
