import { relations } from "drizzle-orm";
import { integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const user = pgTable('users', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 15 }).unique(),
    mail: varchar('mail'),
    phoneNumber: varchar('phonenumber'),
    createdAt: timestamp('createdAt').defaultNow(),
});

export const userOauth = pgTable('users_social', {
  id: integer('id').primaryKey(),
  providerId: varchar('provider_id', { length: 255 }).notNull(),
  providerType: varchar('provider_type', { length: 255 }).notNull()
})
export const userLocal = pgTable('users_local', {
  id: integer('id').primaryKey(),
  password: varchar('password', { length: 60 }).notNull(),
  localCreatedAt: timestamp('createdAt').defaultNow(),
})


export const userRelations = relations(user, ({ one }) => ({
  detail: one(userOauth, {
    fields: [user.id],
    references: [userOauth.id],
  }),
  hiddenInfo: one(userLocal, {
    fields: [user.id],
    references: [userLocal.id],
  }),
}));

type A = typeof userRelations.table['_']['columns']