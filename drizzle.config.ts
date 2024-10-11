import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/mocks/schema',
  out: './.cache/.migrations',
  breakpoints: true,
  dbCredentials: {
    url: process.env.DB_URL || '',
    ssl: false,
  },
});
