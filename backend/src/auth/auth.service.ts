import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registro
   * Requisitos:
   * - username único
   * - bcrypt saltRounds >= 10
   * - guardar en DB
   * - try/catch
   */
  async register(registerDto: RegisterDto) {
    try {
      const username = registerDto.username.trim();

      const existing = await this.userRepository.findOne({
        where: { username },
       
      });

      if (existing) {
        // Mensaje seguro (no filtra detalles sensibles)
        throw new BadRequestException('Invalid credentials');
      }

      const hashedPassword = await bcrypt.hash(
        registerDto.password,
        this.SALT_ROUNDS,
      );

      const user = this.userRepository.create({
        username,
        password: hashedPassword,
      });

      await this.userRepository.save(user);

      return { message: 'User registered successfully' };
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;

      // Si es error de constraint unique (por carrera)
      if (err?.code === '23505') {
        throw new BadRequestException('Invalid credentials');
      }

      throw new InternalServerErrorException('Unable to register user');
    }
  }

  /**
   * Validación de credenciales (para login)
   * - buscar por username
   * - bcrypt.compare
   * - retornar user sin password o null
   */
  async validateUser(username: string, pass: string): Promise<Omit<User, 'password'> | null> {
    try {
   
      const user = await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('user.username = :username', { username })
        .getOne();

      if (!user) return null;

      const ok = await bcrypt.compare(pass, user.password);
      if (!ok) return null;

      // remover password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...safe } = user as any;
      return safe;
    } catch {
      // No filtramos detalles
      return null;
    }
  }

  /**
   * Login
   * - payload { username, sub: userId }
   * - retorna { accessToken, user }
   */
  async login(loginDto: LoginDto) {
  const username = loginDto.username.trim();

  const user = await this.validateUser(username, loginDto.password);
  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const payload = {
    username: (user as any).username,
    sub: (user as any).id,
  };

  const accessToken = await this.jwtService.signAsync(payload);

  return {
    access_token: accessToken, // ✅ ESTÁNDAR JWT
    user,
  };
}

  getProfile(user: any) {
    return user;
  }

  /**
   * Para strategy / ws gateway
   */
  async getUserById(id: string | number): Promise<Omit<User, 'password'> | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: id as any },
      });
      if (!user) return null;

     
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...safe } = user as any;
      return safe;
    } catch {
      return null;
    }
  }

 
  async validateUserById(id: string | number) {
    return this.getUserById(id);
  }
}
