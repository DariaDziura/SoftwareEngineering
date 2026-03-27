-- ============================================================
-- MEDIASWAP DATABASE INITIALIZATION SCRIPT
-- Module: Software Engineering (CMP-N204-0)
-- Description: Full-stack 'gift economy' platform for swapping 
-- books and records.
-- ============================================================

-- Target Database
CREATE DATABASE IF NOT EXISTS softwareeng;
USE softwareeng;

-- --------------------------------------------------------
-- 1. MEDIA TYPES
-- --------------------------------------------------------
-- Defines high-level categories (Books and Records) as per 
-- the project description.
CREATE TABLE IF NOT EXISTS media_types (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE
);

-- --------------------------------------------------------
-- 2. GENRES
-- --------------------------------------------------------
-- Linked to types to allow organized browsing and discovery.
CREATE TABLE IF NOT EXISTS genres (
    genre_id INT AUTO_INCREMENT PRIMARY KEY,
    type_id INT,
    genre_name VARCHAR(50) NOT NULL,
    FOREIGN KEY (type_id) REFERENCES media_types(type_id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- 3. USERS
-- --------------------------------------------------------
-- Stores profile data. Data minimization applied (no full addresses) 
-- to protect privacy per Ethical Issues document.
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role ENUM('Admin', 'Member') DEFAULT 'Member',
    phone_number VARCHAR(20),
    city VARCHAR(100), -- Facilitates local community swaps
    rating_score DECIMAL(3, 2) DEFAULT 5.00, -- Trust & Safety feature
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- 4. MEDIA ITEMS
-- --------------------------------------------------------
-- Core inventory. Condition ENUM addresses user concerns 
-- regarding item quality (especially important for vinyl).
CREATE TABLE IF NOT EXISTS media_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT,
    type_id INT,
    genre_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    item_condition ENUM('New', 'Like New', 'Very Good', 'Good', 'Fair', 'Poor') NOT NULL,
    photo_urls TEXT, 
    is_available BOOLEAN DEFAULT TRUE,
    author_artist VARCHAR(255), 
    isbn_album_title VARCHAR(255), -- ISBN for books or Catalog No. for records
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES media_types(type_id),
    FOREIGN KEY (genre_id) REFERENCES genres(genre_id)
);

-- --------------------------------------------------------
-- 5. SWAP TRANSACTIONS
-- --------------------------------------------------------
-- Manages the non-monetary exchange workflow between members.
CREATE TABLE IF NOT EXISTS swap_transactions (
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

-- --------------------------------------------------------
-- 6. MESSAGES
-- --------------------------------------------------------
-- In-app communication for coordinating safe physical meetups.
CREATE TABLE IF NOT EXISTS messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT,
    receiver_id INT,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(user_id),
    FOREIGN KEY (receiver_id) REFERENCES users(user_id)
);

-- --------------------------------------------------------
-- 7. REVIEWS
-- --------------------------------------------------------
-- Trust mechanism to allow users to rate their swapping experience.
CREATE TABLE IF NOT EXISTS reviews (
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
-- SEED DATA (ALIGNED WITH PROJECT PERSONAS)
-- --------------------------------------------------------

-- Initialize Media Types
INSERT INTO media_types (type_name) VALUES ('Book'), ('Record');

-- Initialize Genres
INSERT INTO genres (type_id, genre_name) VALUES 
(1, 'Philosophy'), (1, 'Science Fiction'), 
(2, 'Rock'), (2, 'Jazz');

-- Seed Users (Representing John Villa and Reggie Diesel)
INSERT INTO users (username, email, password_hash, first_name, last_name, phone_number, city)
VALUES
('jvilla', 'john.v@example.com', 'hash123', 'John', 'Villa', '1234567890', 'Oldham'),
('rdiesel', 'reggie.d@example.com', 'hash123', 'Reggie', 'Diesel', '0987654321', 'Manchester');

-- Seed Initial Inventory
INSERT INTO media_items (owner_id, type_id, genre_id, title, author_artist, item_condition, is_available, isbn_album_title)
VALUES
(1, 1, 1, 'Beyond Good and Evil', 'Friedrich Nietzsche', 'Good', 1, '978-0140441611'),
(1, 1, 2, 'Dune', 'Frank Herbert', 'Very Good', 1, '978-0441013593'),
(2, 2, 3, 'Rumours', 'Fleetwood Mac', 'Like New', 1, 'BS-2977'),
(2, 2, 4, 'Kind of Blue', 'Miles Davis', 'Good', 1, 'CL-1355');
