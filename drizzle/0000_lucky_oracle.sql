CREATE TABLE `enquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`route` text NOT NULL,
	`goal` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL
);
