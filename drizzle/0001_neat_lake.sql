CREATE TABLE `orders` (
	`id` varchar(64) NOT NULL,
	`customerName` varchar(180) NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`customerPhone` varchar(40) NOT NULL,
	`address` varchar(1000) NOT NULL,
	`countryCode` varchar(2) NOT NULL DEFAULT 'UA',
	`shippingMethod` enum('nova_poshta','ukrposhta') NOT NULL,
	`paymentMethod` enum('liqpay') NOT NULL DEFAULT 'liqpay',
	`paymentStatus` varchar(64) NOT NULL DEFAULT 'pending',
	`status` enum('pending_payment','processing','shipped','cancelled') NOT NULL DEFAULT 'pending_payment',
	`currency` varchar(3) NOT NULL DEFAULT 'UAH',
	`total` int NOT NULL,
	`items` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`slug` varchar(128) NOT NULL,
	`name` varchar(180) NOT NULL,
	`brand` varchar(120) NOT NULL,
	`description` text NOT NULL,
	`image` varchar(1000) NOT NULL,
	`price` int NOT NULL,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_slug` PRIMARY KEY(`slug`)
);
