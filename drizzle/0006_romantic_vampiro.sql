CREATE TABLE `email_verifications` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `auth_accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `auth_accounts` ADD `email_verified` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
UPDATE auth_accounts SET email_verified = 1 WHERE id IN (SELECT user_id FROM google_identities);
