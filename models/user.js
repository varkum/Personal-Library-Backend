const mongoose = require('mongoose');
const bookSchema = require('./book').BookSchema

const userSchema = new mongoose.Schema({
  username: String,
  hash: String,
  salt: String,
  books: [bookSchema]
});

const Book = new mongoose.model('Book', bookSchema);
const User = new mongoose.model('User', userSchema);