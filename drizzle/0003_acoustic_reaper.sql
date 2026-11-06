CREATE TABLE `supabaseProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`supabaseUserId` varchar(128) NOT NULL,
	`workspaceId` int NOT NULL,
	`email` varchar(320),
	`displayName` varchar(160),
	`avatarUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supabaseProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `supabaseProfiles_supabaseUserId_unique` UNIQUE(`supabaseUserId`)
);
--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerSupabaseUserId` varchar(128) NOT NULL,
	`name` varchar(160) NOT NULL,
	`slug` varchar(180) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspaces_id` PRIMARY KEY(`id`),
	CONSTRAINT `workspaces_ownerSupabaseUserId_unique` UNIQUE(`ownerSupabaseUserId`),
	CONSTRAINT `workspaces_slug_unique` UNIQUE(`slug`)
);
