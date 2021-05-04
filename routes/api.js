
  const router = require('express').Router();
  const mongoose = require('mongoose');
  const passport = require('passport'); 
  const User = mongoose.model('User');
  const jsonwebtoken = require('jsonwebtoken');
  const fs = require('fs');
  const Book = mongoose.model('Book');
  const PUB_KEY = fs.readFileSync(process.cwd() + '/id_rsa_pub.pem'); 

   //mongo methods

   const addNewBook = (userId, newTitle, newAuthor, newRating, newTag, comment, done) => {
     let book = new Book({
       title: newTitle,
       author: newAuthor,
       rating: newRating,
       comments: comment,
       tags: [newTag]
     });

     User.findById(userId, (err, user) => {
       if (err) return done(err);

       user.books.push(book);

       user.save((err, data) => {
         if (err) return done(err);

         done(null, data.books[data.books.length - 1]);
       }) 
     })
   }
   const addNewComment = (title, comment, done) => {
     Book.findOne({ title: title}, (err, book) => {
       if (err) return done(err);
       book.comments.push(comment);
       book.save((err, data) => {
         if (err) return done(err);
         done(null, data);
       })
     })
   }
   const addNewTag = (title, tag, done) => {
     Book.findOne({ title: title}, (err, book) => {
       if (err) return done(err);
       book.tags.push(tag);
       book.save((err, data) => {
         if (err) return done(err);
         done(null, data)
       })
     })
   }
   const updateRating = (title, newRating, done) => {
     Book.findOneAndUpdate({ title: title}, { rating: newRating}, (err, data) => {
       if (err) return done(err);
       done(null, data);
     })
   }
   const showAllBooks = (userId, done) => {
     User.findById(userId, (err, user) => {
       if (err) return done(err);

       done(null, user.books);
     })
   }
   const findBookByTitle = (userId, title, done) => {
     User.findById(userId, (err, user) => {
       if (err) return done(err);

       let book = user.books.find(el => el.title == title);
       done(null, book);
     })
   }
   const deleteBook = (userId, title, done) => {
     User.findById(userId, (err, user) => {
       if (err) return done(err);

       let bookIndex = user.books.findIndex(el => el.title == title);

       user.books.splice(bookIndex, 1);

       user.save((err, data) => {
         if (err) return done(err);

         done(null, null);
       })
     })
   }
   const deleteAllBooks = (userId, done) => {
     User.findById(userId, (err, user) => {
       if (err) return done(err);

       user.books = [];
       done(null, null);
     })
     
     Book.deleteMany({}, (err, data) => {
       if (err) return done(err);
       done(null, data);
     })
   }

  const getTopBooks = (userId, done) => {
    User.findById(userId, (err, user) => {
      if (err) return done(err);

      let topBooks = user.books.filter(book => book.rating > 8);
      done(null, topBooks);      
    })
    
    
  }

  const editComment = (userId, title, comment, done) => {
    User.findById(userId, (err, user) => {
      if (err) return done(err);

      let bookIndex = user.books.findIndex(el => el.title == title);
      user.books[bookIndex].comments = comment; 

      user.save((err, data) => {
        if (err) return done(err);
        done(null, data.books)
      })
    })
    
    Book.findOneAndUpdate({ title: title }, { comments: comment }, {new: true}, (err, data) => {
      if (err) return done(err);
      done(null, data);
    })
  }

//middleware

const getUser = (req, res, next) => {
  let authHeader = req.headers.authorization;
  let token = authHeader.split(' ')[1];
  let payload = jsonwebtoken.verify(token, PUB_KEY);
  const id = payload.sub;

  req.userId = id;
  next();
}
//routes

router.get('/hello', passport.authenticate('jwt', {session: false}), getUser, (req, res) => {
  res.json(req.userId);
})

router.route('/books')
    .get(passport.authenticate('jwt', {session: false}), getUser, (req, res) => {
      showAllBooks(req.userId, (err, data) => {
        if (err) res.json({ "error": "mongo" })
        res.json(data);
      })
    })
    .post(getUser, (req, res) => {
      let title = req.body.title;
      let author = req.body.author;
      let rating = req.body.rating;
      let tags = req.body.tags;
      let comments = req.body.comments;
      addNewBook(req.userId, title, author, rating, tags, comments, (err, data) => {
        if (err) res.json({ "error": "mongo" })
        res.json({ title: data.title, author: data.author, rating: data.rating, tags: data.tags, comments: data.comments })
      })
    })
    .delete(getUser, (req, res) => {
      deleteAllBooks(req.userId, (err, data) => {
        if (err) res.json({ "error": "mongo" })
        res.json('Delete successful')
      })
    });

router.route('/books/top')
  .get(passport.authenticate('jwt', {session: false}), getUser, (req, res) => {
    getTopBooks(req.userId, (err, data) => {
      if (err) res.json({"error": "mongo"});
      res.json(data);
    })
    
  })
router.route('/books/:title/edit')
    .post(getUser, (req, res) => {
      let comments = req.body.comments;
      let title = req.params.title;
      editComment(req.userId, title, comments, (err, data) => {
        if (err) res.json({ "error": "mongo" })
        res.json(data);
      })
    })

router.route('/books/:title')
    .get(getUser, (req, res) => {
      let title = req.params.title;
      findBookByTitle(req.userId, title, (err, book) => {
        if (err) res.json({"error": "mongo"})
        res.json(book);
      })
    })
    .delete(getUser, (req, res) => {
      let title = req.params.title;
      deleteBook(req.userId, title, (err, data) => {
        if (err) res.json({"error": "Mongo"})
        res.json('Delete successful')
      })
    });


module.exports = router;





