import axios from 'axios';
import {
  Injectable,
  BadGatewayException,
  NotFoundException,
} from '@nestjs/common';

export type PokemonSprite = {
  id: number;
  name: string;
  sprite: string;
};

@Injectable()
export class PokemonService {
  private pokemons: PokemonSprite[] = [];

  async getRandomSprite(): Promise<PokemonSprite> {
    try {
      const randomId = Math.floor(Math.random() * 898) + 1;

      const { data } = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${randomId}`,
      );

      const pokemon: PokemonSprite = {
        id: Date.now(),
        name: data.name,
        sprite: data.sprites.front_default,
      };

      this.pokemons.push(pokemon);
      return pokemon;
    } catch (error) {
      throw new BadGatewayException(
        'Error fetching pokemon from PokeAPI',
      );
    }
  }

  findAll(): PokemonSprite[] {
    return this.pokemons;
  }

  remove(id: number) {
    const index = this.pokemons.findIndex(p => p.id === id);

    if (index === -1) {
      throw new NotFoundException('Pokemon not found');
    }

    this.pokemons.splice(index, 1);

    return {
      deleted: true,
      id,
    };
  }

  removeAll() {
    const count = this.pokemons.length;
    this.pokemons = [];

    return {
      deleted: true,
      count,
    };
  }
}
