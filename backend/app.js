const express = require('express');
const bodyParser = require('body-parser');
//lets construct path for all operating systems
const path = require('path');
const app = express();

const postRoutes = require("./routes/posts");
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/node_angular')
  .then(() => {
    console.log('connected to mongodb');
  })
  .catch(() => {
    console.log('connection failed');
  });

// express can manipulate the request, read values from req or send a response along with route management
//use a new middle ware on the incoming request
//this function is executed for every incoming request
// app.use((req, res,next) => {
//   console.log("first middleware");
//   //if you dont call next here the next middleware will not be executed
//   next();
// });

app.use((req,res,next) => {
  //sets which domains cant access our resources
  res.setHeader('Access-Control-Allow-Origin', '*');
  //headers accepted in the request
  res.setHeader('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept");
  //methods accepted
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  next();
});

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended : false}));

//this middleware makes sure that requests going to images get forwarded to backend/images
app.use("/images", express.static(path.join("backend/images")));

app.use("/api/posts", postRoutes);

module.exports = app;
