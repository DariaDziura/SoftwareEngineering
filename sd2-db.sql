-- Database: `softwareeng`
-- --------------------------------------------------------

-- 1. Media Types
-- Defines the high-level categories of items supported by the platform.
CREATE TABLE IF NOT EXISTS media_types (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Genres
-- Linked to specific media types to allow for organized browsing and discovery.
CREATE TABLE IF NOT EXISTS genres (
    genre_id INT AUTO_INCREMENT PRIMARY KEY,
    type_id INT,
    genre_name VARCHAR(50) NOT NULL,
    FOREIGN KEY (type_id) REFERENCES media_types(type_id) ON DELETE CASCADE
);

-- 3. Users
-- Stores profile information. In alignment with ethical goals, we collect minimal data 
-- and prioritize pseudonymized usernames for public display.
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role ENUM('Admin', 'Member') DEFAULT 'Member',
    phone_number VARCHAR(20),
    city VARCHAR(100), -- Used for local community exchange goals
    rating_score DECIMAL(3, 2) DEFAULT 5.00, -- Supports trust and safety
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Media Items
-- The core catalog of books and records available for swap.
CREATE TABLE IF NOT EXISTS media_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT,
    type_id INT,
    genre_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    -- Condition is critical for user trust, especially for vinyl
    item_condition ENUM('New', 'Like New', 'Very Good', 'Good', 'Fair', 'Poor') NOT NULL,
    photo_urls TEXT, 
    is_available BOOLEAN DEFAULT TRUE,
    author_director VARCHAR(255), 
    isbn_album_title VARCHAR(255),
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES media_types(type_id),
    FOREIGN KEY (genre_id) REFERENCES genres(genre_id)
);

-- 5. Swap Transactions
-- Tracks the non-monetary "gift economy" exchanges between members.
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

-- 6. Messages
-- Facilitates coordination of exchanges within the app to ensure safety.
CREATE TABLE IF NOT EXISTS messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT,
    receiver_id INT,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(user_id),
    FOREIGN KEY (receiver_id) REFERENCES users(user_id)
);

-- 7. Reviews
-- Peer-to-peer trust system to mitigate concerns about dishonest users.
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

-- 8. Feedback
-- Direct line for members to report issues or provide suggestions to Admins.
CREATE TABLE IF NOT EXISTS feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT,
    subject VARCHAR(255),
    message_body TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES users(user_id)
);

-- --------------------------------------------------------
-- Seed Data for Testing and Personas
-- --------------------------------------------------------

INSERT INTO media_types (type_name) VALUES ('Book'), ('Record');

INSERT INTO genres (type_id, genre_name) VALUES 
(1, 'Philosophy'), (1, 'Science Fiction'), 
(2, 'Rock'), (2, 'Jazz');

INSERT INTO users (username, email, password_hash, first_name, last_name, city)
VALUES
('jvilla', 'john.v@example.com', 'hash123', 'John', 'Villa', 'Oldham'), -- Persona 1
('rdiesel', 'reggie.d@example.com', 'hash123', 'Reggie', 'Diesel', 'Manchester'); -- Persona 2

INSERT INTO media_items (owner_id, type_id, genre_id, title, author_artist, item_condition, isbn_album_title)
VALUES
(1, 1, 1, 'The Republic', 'Plato', 'Good', '978-0140449143'),
(2, 2, 3, 'Rumours', 'Fleetwood Mac', 'Very Good', 'Vinyl-ABC-123');