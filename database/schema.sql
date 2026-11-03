CREATE DATABASE IF NOT EXISTS kinyarwanda_learn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kinyarwanda_learn;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  wallet_address VARCHAR(42) NOT NULL UNIQUE,
  registration_hash CHAR(66) NOT NULL UNIQUE,
  registration_tx_hash CHAR(66) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  level ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL,
  description TEXT,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vocabulary (
  id INT AUTO_INCREMENT PRIMARY KEY,
  word VARCHAR(120) NOT NULL,
  meaning VARCHAR(200) NOT NULL,
  example_sentence TEXT
);

CREATE TABLE IF NOT EXISTS quizzes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question TEXT NOT NULL,
  option1 VARCHAR(200) NOT NULL,
  option2 VARCHAR(200) NOT NULL,
  option3 VARCHAR(200) NOT NULL,
  option4 VARCHAR(200) NOT NULL,
  answer VARCHAR(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  lesson_id INT NOT NULL,
  completed TINYINT NOT NULL DEFAULT 0,
  score INT NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS forum_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO lessons (title, level, description, content)
SELECT 'Greetings', 'Beginner', 'Basic greetings', 'Muraho = Hello. Mwaramutse = Good morning.'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE title = 'Greetings');

INSERT INTO lessons (title, level, description, content)
SELECT 'Numbers', 'Beginner', 'Learn numbers', 'Rimwe, kabiri, gatatu, kane, gatanu.'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE title = 'Numbers');

INSERT INTO lessons (title, level, description, content)
SELECT 'Family', 'Beginner', 'Family vocabulary', 'Umubyeyi = Parent. Umwana = Child.'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE title = 'Family');

INSERT INTO lessons (title, level, description, content)
SELECT 'Daily Conversation', 'Intermediate', 'Useful conversations', 'Practice common daily sentences.'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE title = 'Daily Conversation');

INSERT INTO lessons (title, level, description, content)
SELECT 'Travel Phrases', 'Intermediate', 'Travel vocabulary', 'Learn useful phrases for travel.'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE title = 'Travel Phrases');

INSERT INTO vocabulary (word, meaning, example_sentence)
SELECT 'Muraho', 'Hello', 'Muraho neza!'
WHERE NOT EXISTS (SELECT 1 FROM vocabulary WHERE word = 'Muraho');

INSERT INTO vocabulary (word, meaning, example_sentence)
SELECT 'Murakoze', 'Thank you', 'Murakoze cyane.'
WHERE NOT EXISTS (SELECT 1 FROM vocabulary WHERE word = 'Murakoze');

INSERT INTO vocabulary (word, meaning, example_sentence)
SELECT 'Yego', 'Yes', 'Yego, ndabyumva.'
WHERE NOT EXISTS (SELECT 1 FROM vocabulary WHERE word = 'Yego');

INSERT INTO vocabulary (word, meaning, example_sentence)
SELECT 'Oya', 'No', 'Oya, murakoze.'
WHERE NOT EXISTS (SELECT 1 FROM vocabulary WHERE word = 'Oya');

INSERT INTO quizzes (question, option1, option2, option3, option4, answer)
SELECT 'What does Muraho mean?', 'Hello', 'Goodbye', 'Thanks', 'No', 'Hello'
WHERE NOT EXISTS (SELECT 1 FROM quizzes WHERE question = 'What does Muraho mean?');

INSERT INTO quizzes (question, option1, option2, option3, option4, answer)
SELECT 'What does Murakoze mean?', 'Please', 'Thank you', 'Good night', 'Welcome', 'Thank you'
WHERE NOT EXISTS (SELECT 1 FROM quizzes WHERE question = 'What does Murakoze mean?');

INSERT INTO quizzes (question, option1, option2, option3, option4, answer)
SELECT 'Which word means yes?', 'Oya', 'Muraho', 'Yego', 'Murakoze', 'Yego'
WHERE NOT EXISTS (SELECT 1 FROM quizzes WHERE question = 'Which word means yes?');
