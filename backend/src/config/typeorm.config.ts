import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export default registerAs('database', (): TypeOrmModuleOptions => {
  const host = process.env.DATABASE_HOST ?? 'localhost';
  const port = Number(process.env.DATABASE_PORT ?? 5432);

  const username =
    (process.env.DATABASE_USER && !process.env.DATABASE_USER.includes('${')
      ? process.env.DATABASE_USER
      : undefined) ?? process.env.POSTGRES_USER;

  const password =
    (process.env.DATABASE_PASSWORD && !process.env.DATABASE_PASSWORD.includes('${')
      ? process.env.DATABASE_PASSWORD
      : undefined) ?? process.env.POSTGRES_PASSWORD;

  const database =
    (process.env.DATABASE_NAME && !process.env.DATABASE_NAME.includes('${')
      ? process.env.DATABASE_NAME
      : undefined) ?? process.env.POSTGRES_DB;

  if (!username) throw new Error('Missing DB username (DATABASE_USER or POSTGRES_USER)');
  if (!password) throw new Error('Missing DB password (DATABASE_PASSWORD or POSTGRES_PASSWORD)');
  if (!database) throw new Error('Missing DB name (DATABASE_NAME or POSTGRES_DB)');

  return {
    type: 'postgres',
    host,
    port,
    username,
    password,
    database,

    entities: [join(__dirname, '/../**/*.entity{.ts,.js}')],

    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV !== 'production',
  };
});
