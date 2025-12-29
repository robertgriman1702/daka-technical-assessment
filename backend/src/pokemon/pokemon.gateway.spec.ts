import { Test, TestingModule } from '@nestjs/testing';
import { PokemonGateway } from './pokemon.gateway';
import { PokemonService } from './pokemon.service';

describe('PokemonGateway', () => {
  let gateway: PokemonGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PokemonGateway, PokemonService],
    }).compile();

    gateway = module.get<PokemonGateway>(PokemonGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
