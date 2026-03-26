-- 1. Media Types (Book, DVD, CD, Vinyl)
CREATE TABLE media_types (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Genres (Linked to specific types)
CREATE TABLE genres (
    genre_id INT AUTO_INCREMENT PRIMARY KEY,
    type_id INT,
    genre_name VARCHAR(50) NOT NULL,
    FOREIGN KEY (type_id) REFERENCES media_types(type_id) ON DELETE CASCADE
);

-- 3. Users (With private data handled via access control)
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

-- 4. Media Items (Using ENUM for fixed condition list)
CREATE TABLE media_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT,
    type_id INT,
    genre_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    item_condition ENUM('New', 'Like New', 'Very Good', 'Good', 'Fair', 'Poor') NOT NULL,
    photo_urls TEXT, -- Store as JSON or comma-separated strings
    is_available BOOLEAN DEFAULT TRUE,
    -- Specific attributes (can be NULL depending on type)
    author_director VARCHAR(255), 
    isbn_album_title VARCHAR(255),
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES media_types(type_id),
    FOREIGN KEY (genre_id) REFERENCES genres(genre_id)
);

-- 5. Swap Transactions (Tracking community exchange)
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

-- 6. Messages (In-app communication)
CREATE TABLE messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT,
    receiver_id INT,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(user_id),
    FOREIGN KEY (receiver_id) REFERENCES users(user_id)
);

-- 7. Reviews (Peer-to-peer trust)
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

-- 8. Admin Feedback (Direct line from Members)
CREATE TABLE feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT,
    subject VARCHAR(255),
    message_body TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES users(user_id)
);