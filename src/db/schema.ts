import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  password_hash: varchar("password_hash", { length: 255 }),
  email: text("email"),
})
