import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: false, // Always false for production/migrations
  logging: false,
  entities: ['dist/**/*.entity.js', 'src/**/*.entity.ts'],
  migrations: ['dist/migrations/*.js', 'src/migrations/*.ts'],
});
