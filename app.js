//jshint esversion:6
require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const bcrypt = require("bcrypt");
const saltRounds = 10;
//const md5 = require('md5');
//const encrypt = require("mongoose-encryption");

const app = express();

//console.log(process.env.API_KEY);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//----------------------DB SETUP-------------------------

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

mongoose.connect("mongodb://localhost:27017/userAuthDB", options);

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Error - Blank Entry"]
  },
  password: {
    type: String,
    required: [true, "Error - Blank Entry"]
  }
});

/*userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ["password"]
});*/

const User = mongoose.model("User", userSchema);



//---------------------ROUTING---------------------------

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {

  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    const newUser = new User({
      email: req.body.username,
      password: hash
      // when using md5 : md5(req.body.password)
    });

    newUser.save(function(err) {
      if (err) {
        console.log(err);
      } else {
        res.render("secrets");
      }
    });
  });
});

app.post("/login", function(req, res) {
  const username = req.body.username;
  const password = req.body.password;
  //const password = md5(req.body.password);

  User.findOne({
    email: username
  }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function(err, result) {
          if (result === true) {
            res.render("secrets");
          }
        });
        //if (foundUser.password === password) {}
      }
    }
  });
});





app.listen(3000, function() {
  console.log("Server started on port 3000");
});