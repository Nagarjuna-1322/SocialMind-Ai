ALTER TABLE `socialPosts` DROP INDEX `socialPosts_postId_unique`;--> statement-breakpoint
ALTER TABLE `brands` ADD `workspaceKey` varchar(128) DEFAULT 'legacy' NOT NULL;--> statement-breakpoint
ALTER TABLE `memoryEvents` ADD `workspaceKey` varchar(128) DEFAULT 'legacy' NOT NULL;--> statement-breakpoint
ALTER TABLE `socialPosts` ADD `workspaceKey` varchar(128) DEFAULT 'legacy' NOT NULL;