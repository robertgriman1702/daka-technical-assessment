import { Module } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { PokemonGateway } from './pokemon.gateway';
import { PokemonController } from './pokemon.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'secretKey',
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [PokemonController],
  providers: [PokemonGateway, PokemonService],
  exports: [PokemonService],
})
export class PokemonModule { }
