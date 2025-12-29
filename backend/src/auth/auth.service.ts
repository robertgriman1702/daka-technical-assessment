import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from './entities/user.entity';

import { JwtService } from '@nestjs/jwt';

import { PokemonService } from '../pokemon/pokemon.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly pokemonService: PokemonService,
  ) { }


  private revokedTokens: Set<string> = new Set();

  // ... existing code ...

  async logout(token: string) {
    this.pokemonService.removeAll();
    this.revokedTokens.add(token);
    return {
      message: 'User logged out successfully',
    };
  }

  isTokenRevoked(token: string): boolean {
    return this.revokedTokens.has(token);
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userRepository.findOneBy({ username });
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  async register(registerDto: RegisterDto) {
    const user = await this.userRepository.findOneBy({
      username: registerDto.username,
    });

    if (user) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser = this.userRepository.create({
      username: registerDto.username,
      password: hashedPassword,
    });

    await this.userRepository.save(newUser);

    return {
      message: 'User created successfully',
    };
  }



  getProfile(user: any) {
    return user;
  }

  async getUserById(id: number): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ id });
    if (user) {
      const { password, ...result } = user;
      return result as User;
    }
    return null;
  }
}
