import {
  sqliteTable,
  text,
  index,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";
export const githubConnections = sqliteTable("github_connections", {
  userId: text("user_id").primaryKey(),
  login: text("login").notNull(),
  githubId: text("github_id").notNull(),
  token: text("token").notNull(),
  connectedAt: text("connected_at").notNull(),
  repository: text("repository").notNull().default(""),
  branch: text("branch").notNull().default(""),
  autoPush: integer("auto_push").notNull().default(0),
});
export const githubPushes = sqliteTable("github_pushes", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), repository:text("repository").notNull(), branch:text("branch").notNull(), path:text("path").notNull(), status:text("status").notNull(), url:text("url").notNull().default(""),
});
export const telegramConnections = sqliteTable("telegram_connections", {
  userId: text("user_id").primaryKey(),
  chatId: text("chat_id").notNull().unique(),
  preferences: text("preferences").notNull(),
});
export const telegramLinks = sqliteTable("telegram_links", {
  token: text("token").primaryKey(),
  userId: text("user_id").notNull(),
  expires: integer("expires").notNull(),
  preferences: text("preferences").notNull(),
});
export const reminderDeliveries = sqliteTable("reminder_deliveries", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull(),
  created: text("created").notNull(),
});
export const schedulerState = sqliteTable("scheduler_state", {
  key: text("key").primaryKey(), value: text("value").notNull(),
});
export const githubStates = sqliteTable("github_oauth_states", {
  state: text("state").primaryKey(),
  userId: text("user_id").notNull(),
  verifier: text("verifier").notNull(),
  expires: integer("expires").notNull(),
});
export const records = sqliteTable(
  "records",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    data: text("data").notNull(),
    created: text("created").notNull(),
  },
  (t) => [index("idx_records_user_created").on(t.userId, t.created)],
);
export const profiles = sqliteTable("profiles", {
  userId: text("user_id").primaryKey(),
  data: text("data").notNull(),
});
export const challenges = sqliteTable("challenges", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  title: text("title").notNull(),
  problemId: text("problem_id").notNull(),
  deadline: text("deadline").notNull(),
  created: text("created").notNull(),
});
export const members = sqliteTable(
  "members",
  {
    challengeId: text("challenge_id").notNull(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    completed: integer("completed").notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.challengeId, t.userId] }),
    index("idx_members_user").on(t.userId),
  ],
);
export const files = sqliteTable(
  "files",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    mime: text("mime").notNull(),
    size: integer("size").notNull(),
    created: text("created").notNull(),
  },
  (t) => [index("idx_files_user").on(t.userId)],
);
export const aiUsage = sqliteTable(
  "ai_usage",
  {
    userId: text("user_id").notNull(),
    day: text("day").notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })],
);

export const authAccounts = sqliteTable('auth_accounts', {
  id:text('id').primaryKey(), email:text('email').notNull().unique(), name:text('name').notNull(), passwordHash:text('password_hash'), created:integer('created').notNull(),
});
export const authSessions = sqliteTable('auth_sessions', {
  tokenHash:text('token_hash').primaryKey(), userId:text('user_id').notNull().references(()=>authAccounts.id,{onDelete:'cascade'}), expires:integer('expires').notNull(),
},t=>[index('auth_sessions_user').on(t.userId)]);
export const authLimits = sqliteTable('auth_limits', {
 key:text('key').primaryKey(),count:integer('count').notNull(),expires:integer('expires').notNull(),
});
export const passwordResets = sqliteTable('password_resets', {
 tokenHash:text('token_hash').primaryKey(), userId:text('user_id').notNull().references(()=>authAccounts.id,{onDelete:'cascade'}), expires:integer('expires').notNull(),
});

export const googleIdentities=sqliteTable('google_identities',{sub:text('sub').primaryKey(),userId:text('user_id').notNull().unique().references(()=>authAccounts.id,{onDelete:'cascade'})});
export const googleLoginStates=sqliteTable('google_login_states',{state:text('state').primaryKey(),verifier:text('verifier').notNull(),expires:integer('expires').notNull()});
