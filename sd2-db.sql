-- ============================================================
-- MEDIASWAP DATABASE INITIALIZATION SCRIPT
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
CREATE DATABASE IF NOT EXISTS softwareeng;
USE softwareeng;

-- Clear existing data to allow clean re-seeding
DROP TABLE IF EXISTS reviews, messages, swap_transactions, media_items, users, genres, media_types;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. MEDIA TYPES
CREATE TABLE media_types (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. GENRES
CREATE TABLE genres (
    genre_id INT AUTO_INCREMENT PRIMARY KEY,
    type_id INT,
    genre_name VARCHAR(50) NOT NULL,
    FOREIGN KEY (type_id) REFERENCES media_types(type_id) ON DELETE CASCADE
);

-- 3. USERS
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role ENUM('Admin', 'Member') DEFAULT 'Member',
    phone_number VARCHAR(20),
    city VARCHAR(100),
    rating_score DECIMAL(3, 2) DEFAULT 5.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. MEDIA ITEMS
-- Updated: is_available is now an ENUM and NOT NULL
CREATE TABLE media_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT,
    type_id INT,
    genre_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    item_condition ENUM('New', 'Like New', 'Very Good', 'Good', 'Fair', 'Poor') NOT NULL,
    photo_urls TEXT, 
    is_available ENUM('Available', 'Swapped') NOT NULL DEFAULT 'Available',
    author_artist VARCHAR(255), 
    isbn_album_title VARCHAR(255),
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES media_types(type_id),
    FOREIGN KEY (genre_id) REFERENCES genres(genre_id)
);

-- 5. SWAP TRANSACTIONS
CREATE TABLE swap_transactions (
    swap_id INT AUTO_INCREMENT PRIMARY KEY,
    requester_id INT,
    owner_id INT,
    item_id INT,
    status ENUM('Pending', 'Accepted', 'Declined', 'Completed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(user_id),
    FOREIGN KEY (owner_id) REFERENCES users(user_id),
    FOREIGN KEY (item_id) REFERENCES media_items(item_id)
);

-- 6. MESSAGES
CREATE TABLE messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT,
    receiver_id INT,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(user_id),
    FOREIGN KEY (receiver_id) REFERENCES users(user_id)
);

-- 7. REVIEWS
CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    reviewer_id INT,
    reviewee_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewer_id) REFERENCES users(user_id),
    FOREIGN KEY (reviewee_id) REFERENCES users(user_id)
);

-- --------------------------------------------------------
-- SEED DATA
-- --------------------------------------------------------

-- Initialize Media Types
INSERT INTO media_types (type_id, type_name) VALUES (1, 'Book'), (2, 'Record');

-- Initialize Genres
INSERT INTO genres (genre_id, type_id, genre_name) VALUES 
(1, 1, 'Philosophy'), (2, 1, 'Science Fiction'), (3, 1, 'Non-Fiction'), (4, 1, 'Classic Literature'),
(5, 2, 'Rock'), (6, 2, 'Jazz'), (7, 2, 'Electronic'), (8, 2, 'Blues');

-- Seed Users
INSERT INTO users (user_id, username, email, password_hash, first_name, last_name, phone_number, city)
VALUES
(1, 'jvilla', 'john.v@example.com', 'hash123', 'John', 'Villa', '1234567890', 'Oldham'),
(2, 'rdiesel', 'reggie.d@example.com', 'hash123', 'Reggie', 'Diesel', '0987654321', 'Manchester'),
(3, 'sarah_reads', 'sarah.s@example.com', 'hash123', 'Sarah', 'Smith', '0771234567', 'Salford'),
(4, 'vinyl_vibe', 'mike.m@example.com', 'hash123', 'Mike', 'Jones', '0788888888', 'Stockport');

-- Seed Initial Inventory (Updated with ENUM 'Available')
INSERT INTO media_items (owner_id, type_id, genre_id, title, author_artist, item_condition, is_available, isbn_album_title, description)
VALUES
(1, 1, 1, 'Beyond Good and Evil', 'Friedrich Nietzsche', 'Good', 'Available', '978-0140441611', 'Classic philosophy text.'),
(1, 1, 2, 'Dune', 'Frank Herbert', 'Very Good', 'Available', '978-0441013593', 'First book in the Dune saga.'),
(2, 2, 5, 'Rumours', 'Fleetwood Mac', 'Like New', 'Available', '1977 Warner Bros. Original Pressing', 'Perfect condition.'),
(2, 2, 6, 'Kind of Blue', 'Miles Davis', 'Good', 'Available', 'Columbia Records 180g Reissue', 'Great jazz staple.'),
(3, 1, 3, 'Sapiens', 'Yuval Noah Harari', 'New', 'Available', '978-0062316097', 'A brief history of humankind.'),
(3, 1, 4, '1984', 'George Orwell', 'Fair', 'Available', '978-0451524935', 'Vintage paperback.'),
(4, 2, 7, 'Discovery', 'Daft Punk', 'Like New', 'Available', '2021 Gatefold Vinyl Reissue', 'Electronic classic.'),
(4, 2, 8, 'At Newport', 'Muddy Waters', 'Very Good', 'Available', '1960 Chess Records Mono Pressing', 'Classic blues.');