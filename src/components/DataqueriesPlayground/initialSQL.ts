export const initialSQL = `
CREATE TABLE books (
  book_id INT PRIMARY KEY,
  title VARCHAR(100),
  author VARCHAR(100),
  genre VARCHAR(50),
  published_year INT,
  available_copies INT
);

INSERT INTO books (book_id, title, author, genre, published_year, available_copies)
VALUES
  (1, 'To Kill a Mockingbird', 'Harper Lee', 'Fiction', 1960, 5),
  (2, '1984', 'George Orwell', 'Dystopian', 1949, 3),
  (3, 'The Great Gatsby', 'F. Scott Fitzgerald', 'Classic', 1925, 4),
  (4, 'Pride and Prejudice', 'Jane Austen', 'Romance', 1813, 2),
  (5, 'The Hobbit', 'J.R.R. Tolkien', 'Fantasy', 1937, 6);

CREATE TABLE borrowers (
  borrower_id INT PRIMARY KEY,
  full_name VARCHAR(100),
  email VARCHAR(100),
  phone_number VARCHAR(20),
  address VARCHAR(200)
);

INSERT INTO borrowers (borrower_id, full_name, email, phone_number, address)
VALUES
  (1, 'Alice Johnson', 'alice.johnson@email.com', '09171234567', 'Tarlac City'),
  (2, 'Brian Cruz', 'brian.cruz@email.com', '09181234567', 'Capas, Tarlac'),
  (3, 'Carla Dela Cruz', 'carla.dc@email.com', '09221234567', 'Victoria, Tarlac');

CREATE TABLE borrow_records (
  record_id INT PRIMARY KEY,
  borrower_id INT,
  book_id INT,
  borrow_date DATE,
  return_date DATE,
  status VARCHAR(20),
  FOREIGN KEY (borrower_id) REFERENCES borrowers(borrower_id),
  FOREIGN KEY (book_id) REFERENCES books(book_id)
);

INSERT INTO borrow_records (record_id, borrower_id, book_id, borrow_date, return_date, status)
VALUES
  (1, 1, 2, '2025-10-10', '2025-10-17', 'Returned'),
  (2, 2, 5, '2025-10-12', NULL, 'Borrowed'),
  (3, 3, 1, '2025-10-15', NULL, 'Borrowed');
`;
