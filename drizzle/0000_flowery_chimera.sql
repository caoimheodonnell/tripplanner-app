CREATE TABLE `activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trip_id` integer NOT NULL,
	`category_id` integer NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`duration_minutes` integer,
	`count` integer DEFAULT 1,
	`notes` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`colour` text DEFAULT '#4A90D9' NOT NULL,
	`icon` text DEFAULT '🗺️' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `targets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`label` text NOT NULL,
	`period` text NOT NULL,
	`target_value` real NOT NULL,
	`unit` text NOT NULL,
	`category_id` integer,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `trips` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`destination` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`cover_colour` text DEFAULT '#4A90D9' NOT NULL,
	`notes` text,
	`created_at` text NOT NULL
);
