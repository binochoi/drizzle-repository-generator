import { defineConfig } from 'drizzle-kit';
import { connection } from 'src/mocks/db';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/mocks/schema',
  out: './.cache/.migrations',
  breakpoints: true,
  dbCredentials: {
    ...connection,
    ssl: false,
  },
});
