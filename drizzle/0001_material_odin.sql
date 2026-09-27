CREATE TABLE `brands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`industry` varchar(160) NOT NULL,
	`targetAudience` text NOT NULL,
	`brandTone` text NOT NULL,
	`platforms` text NOT NULL,
	`contentGoals` text NOT NULL,
	`preferredFormats` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brands_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memoryEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`operation` enum('retain','recall','reflect') NOT NULL,
	`status` varchar(40) NOT NULL,
	`summary` text NOT NULL,
	`query` text,
	`sourcePostIds` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `memoryEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `socialPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` varchar(64) NOT NULL,
	`date` timestamp NOT NULL,
	`platform` varchar(40) NOT NULL,
	`topic` varchar(120) NOT NULL,
	`contentType` varchar(80) NOT NULL,
	`caption` text NOT NULL,
	`views` int NOT NULL DEFAULT 0,
	`reach` int NOT NULL DEFAULT 0,
	`likes` int NOT NULL DEFAULT 0,
	`comments` int NOT NULL DEFAULT 0,
	`shares` int NOT NULL DEFAULT 0,
	`engagementRate` double NOT NULL DEFAULT 0,
	`postingTime` varchar(20) NOT NULL,
	`audienceResponse` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `socialPosts_id` PRIMARY KEY(`id`),
	CONSTRAINT `socialPosts_postId_unique` UNIQUE(`postId`)
);
