require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const passport = require('passport');

require('./config/database');
require('./models/user');
require('./config/passport')(passport);



//middleware
app.use(passport.initialize());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.json());

//routes
app.get('/', (req, res) => {
  res.send('Hello from the Personal Library API!');
})

app.use(require('./routes'))

//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
}); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log(`Listening on port ${PORT}`);
});