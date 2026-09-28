CREATE TABLE `google_identities` (
	`sub` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `auth_accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `google_identities_user_id_unique` ON `google_identities` (`user_id`);--> statement-breakpoint
CREATE TABLE `google_login_states` (
	`state` text PRIMARY KEY NOT NULL,
	`verifier` text NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE _sessions_backup AS SELECT * FROM auth_sessions;
CREATE TABLE _resets_backup AS SELECT * FROM password_resets;--> statement-breakpoint
CREATE TABLE `__new_auth_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password_hash` text,
	`created` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_auth_accounts`("id", "email", "name", "password_hash", "created") SELECT "id", "email", "name", "password_hash", "created" FROM `auth_accounts`;--> statement-breakpoint
DROP TABLE `auth_accounts`;--> statement-breakpoint
ALTER TABLE `__new_auth_accounts` RENAME TO `auth_accounts`;--> statement-breakpoint
INSERT OR IGNORE INTO auth_sessions SELECT * FROM _sessions_backup;
INSERT OR IGNORE INTO password_resets SELECT * FROM _resets_backup;
DROP TABLE _sessions_backup;
DROP TABLE _resets_backup;--> statement-breakpoint
CREATE UNIQUE INDEX `auth_accounts_email_unique` ON `auth_accounts` (`email`);