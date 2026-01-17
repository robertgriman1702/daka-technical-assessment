import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PokemonController } from './pokemon.controller';
import { PokemonService } from './pokemon.service';
import { PokemonGateway } from './pokemon.gateway.TODO';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [PokemonController],
  providers: [PokemonService, PokemonGateway],
})
export class PokemonModule {}

