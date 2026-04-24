-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Apr 24, 2026 at 12:04 PM
-- Wersja serwera: 9.6.0
-- Wersja PHP: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Baza danych: `softwareeng`
--

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `genres`
--

CREATE TABLE `genres` (
  `genre_id` int NOT NULL,
  `type_id` int DEFAULT NULL,
  `genre_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Zrzut danych tabeli `genres`
--

INSERT INTO `genres` (`genre_id`, `type_id`, `genre_name`) VALUES
(1, 1, 'Philosophy'),
(2, 1, 'Science Fiction'),
(3, 1, 'Non-Fiction'),
(4, 1, 'Classic Literature'),
(5, 2, 'Rock'),
(6, 2, 'Jazz'),
(7, 2, 'Electronic'),
(8, 2, 'Blues');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `media_items`
--

CREATE TABLE `media_items` (
  `item_id` int NOT NULL,
  `owner_id` int DEFAULT NULL,
  `type_id` int DEFAULT NULL,
  `genre_id` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `item_condition` enum('New','Like New','Very Good','Good','Fair','Poor') NOT NULL,
  `photo_urls` text,
  `is_available` enum('Available','Swapped') NOT NULL DEFAULT 'Available',
  `author_artist` varchar(255) DEFAULT NULL,
  `isbn_album_title` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Zrzut danych tabeli `media_items`
--

INSERT INTO `media_items` (`item_id`, `owner_id`, `type_id`, `genre_id`, `title`, `description`, `item_condition`, `photo_urls`, `is_available`, `author_artist`, `isbn_album_title`) VALUES
(1, 1, 1, 1, 'Beyond Good and Evil', 'Classic philosophy text.', 'Good', NULL, 'Available', 'Friedrich Nietzsche', '978-0140441611'),
(2, 1, 1, 2, 'Dune', 'First book in the Dune saga.', 'Very Good', NULL, 'Available', 'Frank Herbert', '978-0441013593'),
(3, 2, 2, 5, 'Rumours', 'Perfect condition.', 'Like New', NULL, 'Available', 'Fleetwood Mac', '1977 Warner Bros. Original Pressing'),
(4, 2, 2, 6, 'Kind of Blue', 'Great jazz staple.', 'Good', NULL, 'Available', 'Miles Davis', 'Columbia Records 180g Reissue'),
(5, 3, 1, 3, 'Sapiens', 'A brief history of humankind.', 'New', NULL, 'Available', 'Yuval Noah Harari', '978-0062316097'),
(6, 3, 1, 4, '1984', 'Vintage paperback.', 'Fair', NULL, 'Available', 'George Orwell', '978-0451524935'),
(7, 4, 2, 7, 'Discovery', 'Electronic classic.', 'Like New', NULL, 'Available', 'Daft Punk', '2021 Gatefold Vinyl Reissue'),
(8, 4, 2, 8, 'At Newport', 'Classic blues.', 'Very Good', NULL, 'Available', 'Muddy Waters', '1960 Chess Records Mono Pressing');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `media_types`
--

CREATE TABLE `media_types` (
  `type_id` int NOT NULL,
  `type_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Zrzut danych tabeli `media_types`
--

INSERT INTO `media_types` (`type_id`, `type_name`) VALUES
(1, 'Book'),
(2, 'Record');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `messages`
--

CREATE TABLE `messages` (
  `message_id` int NOT NULL,
  `sender_id` int DEFAULT NULL,
  `receiver_id` int DEFAULT NULL,
  `content` text NOT NULL,
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `reviews`
--

CREATE TABLE `reviews` (
  `review_id` int NOT NULL,
  `reviewer_id` int DEFAULT NULL,
  `reviewee_id` int DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `swap_transactions`
--

CREATE TABLE `swap_transactions` (
  `swap_id` int NOT NULL,
  `requester_id` int DEFAULT NULL,
  `owner_id` int DEFAULT NULL,
  `item_id` int DEFAULT NULL,
  `status` enum('Pending','Accepted','Declined','Completed') DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `users`
--

CREATE TABLE `users` (
  `user_id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `role` enum('Admin','Member') DEFAULT 'Member',
  `phone_number` varchar(20) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `rating_score` decimal(3,2) DEFAULT '5.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Zrzut danych tabeli `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `password_hash`, `first_name`, `last_name`, `role`, `phone_number`, `city`, `rating_score`, `created_at`) VALUES
(1, 'jvilla', 'john.v@example.com', 'hash123', 'John', 'Villa', 'Member', '1234567890', 'Oldham', 5.00, '2026-03-27 15:25:18'),
(2, 'rdiesel', 'reggie.d@example.com', 'hash123', 'Reggie', 'Diesel', 'Member', '0987654321', 'Manchester', 5.00, '2026-03-27 15:25:18'),
(3, 'sarah_reads', 'sarah.s@example.com', 'hash123', 'Sarah', 'Smith', 'Member', '0771234567', 'Salford', 5.00, '2026-03-27 15:25:18'),
(4, 'vinyl_vibe', 'mike.m@example.com', 'hash123', 'Mike', 'Jones', 'Member', '0788888888', 'Stockport', 5.00, '2026-03-27 15:25:18');

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `genres`
--
ALTER TABLE `genres`
  ADD PRIMARY KEY (`genre_id`),
  ADD KEY `type_id` (`type_id`);

--
-- Indeksy dla tabeli `media_items`
--
ALTER TABLE `media_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `owner_id` (`owner_id`),
  ADD KEY `type_id` (`type_id`),
  ADD KEY `genre_id` (`genre_id`);

--
-- Indeksy dla tabeli `media_types`
--
ALTER TABLE `media_types`
  ADD PRIMARY KEY (`type_id`),
  ADD UNIQUE KEY `type_name` (`type_name`);

--
-- Indeksy dla tabeli `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`);

--
-- Indeksy dla tabeli `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `reviewer_id` (`reviewer_id`),
  ADD KEY `reviewee_id` (`reviewee_id`);

--
-- Indeksy dla tabeli `swap_transactions`
--
ALTER TABLE `swap_transactions`
  ADD PRIMARY KEY (`swap_id`),
  ADD KEY `requester_id` (`requester_id`),
  ADD KEY `owner_id` (`owner_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indeksy dla tabeli `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT dla zrzuconych tabel
--

--
-- AUTO_INCREMENT dla tabeli `genres`
--
ALTER TABLE `genres`
  MODIFY `genre_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT dla tabeli `media_items`
--
ALTER TABLE `media_items`
  MODIFY `item_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT dla tabeli `media_types`
--
ALTER TABLE `media_types`
  MODIFY `type_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT dla tabeli `messages`
--
ALTER TABLE `messages`
  MODIFY `message_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT dla tabeli `reviews`
--
ALTER TABLE `reviews`
  MODIFY `review_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT dla tabeli `swap_transactions`
--
ALTER TABLE `swap_transactions`
  MODIFY `swap_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT dla tabeli `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Ograniczenia dla zrzutów tabel
--

--
-- Ograniczenia dla tabeli `genres`
--
ALTER TABLE `genres`
  ADD CONSTRAINT `genres_ibfk_1` FOREIGN KEY (`type_id`) REFERENCES `media_types` (`type_id`) ON DELETE CASCADE;

--
-- Ograniczenia dla tabeli `media_items`
--
ALTER TABLE `media_items`
  ADD CONSTRAINT `media_items_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `media_items_ibfk_2` FOREIGN KEY (`type_id`) REFERENCES `media_types` (`type_id`),
  ADD CONSTRAINT `media_items_ibfk_3` FOREIGN KEY (`genre_id`) REFERENCES `genres` (`genre_id`);

--
-- Ograniczenia dla tabeli `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`user_id`);

--
-- Ograniczenia dla tabeli `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`reviewee_id`) REFERENCES `users` (`user_id`);

--
-- Ograniczenia dla tabeli `swap_transactions`
--
ALTER TABLE `swap_transactions`
  ADD CONSTRAINT `swap_transactions_ibfk_1` FOREIGN KEY (`requester_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `swap_transactions_ibfk_2` FOREIGN KEY (`owner_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `swap_transactions_ibfk_3` FOREIGN KEY (`item_id`) REFERENCES `media_items` (`item_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
