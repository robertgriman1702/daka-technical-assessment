import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PokemonService {
  private sprites: any[] = [];

  async getRandomSprite(): Promise<string> {
    const randomId = Math.floor(Math.random() * 898) + 1;
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      const spriteUrl = response.data.sprites.front_default || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png';

      const newSprite = {
        id: Date.now(),
        url: spriteUrl,
        name: response.data.name
      };

      this.sprites.push(newSprite);
      return spriteUrl;
    } catch (error) {
      console.error('Error fetching pokemon', error);
      throw new Error('Failed to fetch pokemon');
    }
  }


  getLastSprite() {
    return this.sprites[this.sprites.length - 1];
  }

  create(dto: any) { }

  findAll() {
    return this.sprites;
  }

  findOne(id: number) {
    return this.sprites.find(s => s.id === id);
  }

  update(id: number, dto: any) { }

  remove(id: number) {
    this.sprites = this.sprites.filter(s => s.id !== id);
    return { deleted: true, id };
  }
  removeAll() {
    this.sprites = [];
    return { deleted: true, count: 0 };
  }
}
