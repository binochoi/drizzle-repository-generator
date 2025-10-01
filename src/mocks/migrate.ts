import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, client } from './db/pg';

migrate(db, { migrationsFolder: './.cache/.migrations', })
  .then(() => client.end());
