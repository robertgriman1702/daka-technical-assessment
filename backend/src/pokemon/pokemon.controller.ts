import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { PokemonService } from './pokemon.service';

@ApiTags('Pokemon')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  @ApiOperation({ summary: 'Get all pokemons' })
  findAll() {
    return this.pokemonService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Get random pokemon sprite' })
  create() {
    return this.pokemonService.getRandomSprite();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete pokemon by id' })
  remove(@Param('id') id: string) {
    return this.pokemonService.remove(Number(id));
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all pokemons' })
  removeAll() {
    return this.pokemonService.removeAll();
  }
}
