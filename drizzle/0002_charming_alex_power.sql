CREATE TABLE `github_pushes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`repository` text NOT NULL,
	`branch` text NOT NULL,
	`path` text NOT NULL,
	`status` text NOT NULL,
	`url` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reminder_deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`status` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scheduler_state` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `telegram_connections` (
	`user_id` text PRIMARY KEY NOT NULL,
	`chat_id` text NOT NULL,
	`preferences` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `telegram_connections_chat_id_unique` ON `telegram_connections` (`chat_id`);--> statement-breakpoint
CREATE TABLE `telegram_links` (
	`token` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires` integer NOT NULL,
	`preferences` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `github_connections` ADD `repository` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `github_connections` ADD `branch` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `github_connections` ADD `auto_push` integer DEFAULT 0 NOT NULL;