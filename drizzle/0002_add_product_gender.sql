ALTER TABLE `products` ADD `gender` enum('men','women') DEFAULT 'women' NOT NULL;--> statement-breakpoint
UPDATE `products` SET `gender` = 'men' WHERE `slug` IN ('aventus', 'sauvage', 'terre-dhermes');
--> statement-breakpoint
UPDATE `products` SET `gender` = 'men' WHERE `slug` IN ('bleu-de-chanel', 'le-male');
