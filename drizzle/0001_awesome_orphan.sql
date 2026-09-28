CREATE TABLE `github_connections` (
	`user_id` text PRIMARY KEY NOT NULL,
	`login` text NOT NULL,
	`github_id` text NOT NULL,
	`token` text NOT NULL,
	`connected_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `github_oauth_states` (
	`state` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`verifier` text NOT NULL,
	`expires` integer NOT NULL
);
