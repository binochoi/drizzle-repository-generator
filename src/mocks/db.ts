import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

export const connection = {
    host: 'localhost',
    database: 'tester',
    user: 'abc123',
    password: 'abc123',
    port: 13131
}
export const client = new Pool(connection);
export const db = drizzle(client, { schema });
