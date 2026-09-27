CREATE TABLE `events` (
	`day` text NOT NULL,
	`name` text NOT NULL,
	`source` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`day`, `name`, `source`)
);
