CREATE TABLE `instagramConnections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceKey` varchar(120) NOT NULL,
	`instagramUserId` varchar(120) NOT NULL,
	`username` varchar(160) NOT NULL,
	`accountType` varchar(40),
	`accessTokenEncrypted` text NOT NULL,
	`tokenExpiresAt` timestamp,
	`lastSyncedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `instagramConnections_id` PRIMARY KEY(`id`),
	CONSTRAINT `instagramConnections_workspaceKey_unique` UNIQUE(`workspaceKey`)
);
