const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
     title: String,
     author: String,
     rating: Number,
     comments: String,
     tags: [String]
   });

   

 module.exports.BookSchema = bookSchema;