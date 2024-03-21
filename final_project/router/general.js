const express = require('express');
const { books } = require("./booksdb.js");
const { isValid, users } = require("./auth_users.js");
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).json(JSON.stringify(books));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(book);
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const { author } = req.params;
  const booksByAuthor = Object.values(books).filter(book => book.author === author);
  if (booksByAuthor.length === 0) {
    return res.status(404).json({ message: "No books found for the author" });
  }
  return res.status(200).json(booksByAuthor);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const { title } = req.params;
  const booksByTitle = Object.values(books).filter(book => book.title === title);
  if (booksByTitle.length === 0) {
    return res.status(404).json({ message: "No books found with the given title" });
  }
  return res.status(200).json(booksByTitle);
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;