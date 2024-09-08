import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const connection = {
    host: '',
    database: '',
    user: '',
    password: '',
    port: 5432
}
export const client = new Pool(connection);
export const db = drizzle(client, { schema });
