import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../schema';

export const client = postgres(process.env.DB_URL || '', { prepare: false });
export const db = drizzle(client, { schema });
