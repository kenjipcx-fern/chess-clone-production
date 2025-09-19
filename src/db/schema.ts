import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core"
import { relations } from "drizzle-orm"
import type { AdapterAccountType } from "next-auth/adapters"

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  rating: integer("rating").default(1200),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .$defaultFn(() => Date.now()),
})

export const accounts = sqliteTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

export const sessions = sqliteTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
})

export const verificationTokens = sqliteTable(
  "verificationTokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
)

export const authenticators = sqliteTable(
  "authenticators",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: integer("credentialBackedUp", {
      mode: "boolean",
    }).notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
)

export const games = sqliteTable("games", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  whitePlayerId: text("whitePlayerId")
    .references(() => users.id),
  blackPlayerId: text("blackPlayerId")
    .references(() => users.id),
  status: text("status", { enum: ["waiting", "in_progress", "completed", "draw"] })
    .default("waiting"),
  result: text("result", { enum: ["white", "black", "draw"] }),
  currentFen: text("currentFen").default("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"),
  timeControl: text("timeControl").default("10+5"),
  whiteTimeLeft: integer("whiteTimeLeft").default(600000), // 10 minutes in ms
  blackTimeLeft: integer("blackTimeLeft").default(600000), // 10 minutes in ms
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .$defaultFn(() => Date.now()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .$defaultFn(() => Date.now()),
})

export const moves = sqliteTable("moves", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  gameId: text("gameId")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),
  moveNumber: integer("moveNumber").notNull(),
  from: text("from").notNull(),
  to: text("to").notNull(),
  promotion: text("promotion"),
  san: text("san").notNull(),
  fen: text("fen").notNull(),
  timestamp: integer("timestamp", { mode: "timestamp_ms" })
    .$defaultFn(() => Date.now()),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  whiteGames: many(games, { relationName: "whitePlayer" }),
  blackGames: many(games, { relationName: "blackPlayer" }),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const gamesRelations = relations(games, ({ one, many }) => ({
  whitePlayer: one(users, { 
    fields: [games.whitePlayerId], 
    references: [users.id],
    relationName: "whitePlayer"
  }),
  blackPlayer: one(users, { 
    fields: [games.blackPlayerId], 
    references: [users.id],
    relationName: "blackPlayer" 
  }),
  moves: many(moves),
}))

export const movesRelations = relations(moves, ({ one }) => ({
  game: one(games, { fields: [moves.gameId], references: [games.id] }),
}))
