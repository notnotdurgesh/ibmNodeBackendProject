const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, 'hey');
  req.session.authorization = `Bearer ${token}`;
  return res.status(200).json({ message: "Login successful" });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const token = req.session.authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, 'hey');
    const { username } = decoded;

    const book = books.books.find(book => book.ISBN === isbn);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const userReview = book.reviews.find(review => review.user === username);
    if (userReview) {
      userReview.review = review;
    } else {
      book.reviews.push({ user: username, review });
    }

    return res.status(200).json({ message: "Review added/updated successfully" });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const token = req.session.authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, 'hey');
    const { username } = decoded;

    const book = books.books.find(book => book.ISBN === isbn);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    book.reviews = book.reviews.filter(review => review.user !== username);

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;