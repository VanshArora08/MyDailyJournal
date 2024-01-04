//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const ejs = require("ejs");
const _ = require('lodash');
const mongoose=require('mongoose');
mongoose.connect(process.env.MONGO_URL);

const dailySchema=new mongoose.Schema({
  title:String,
  data:String
})

const AdminPassword=process.env.ADMIN_PASSWORD;
const viewPassword=process.env.VIEW_PASSWORD;
const Day=mongoose.model("Day",dailySchema);

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/",function(req,res){
  const reject = () => {
    res.setHeader("www-authenticate", "Basic");
    res.sendStatus(401);
  };

  const authorization = req.headers.authorization;

  if (!authorization) {
    return reject();
  }

  const [username, password] = Buffer.from(
    authorization.replace("Basic ", ""),
    "base64"
  )
    .toString()
    .split(":");

  if (!((username == "Insane"||username=="LetMeSee") && (password==AdminPassword || password==viewPassword))) {
    return reject();
  }
  Day.find({},function(err,foundItems){
    if(err){
      console.log(err);
    }else{
      res.render("home.ejs",{hData:homeStartingContent,posts:foundItems});
    }
  })
  
})

app.get("/about",function(req,res){
  res.render("about.ejs",{AData:aboutContent});
})

app.get("/compose",function(req,res){
  
  res.render("compose.ejs");
})
app.post("/compose",function(req,res){
  if(req.body.password==AdminPassword){
    const newDay=new Day({
      title: req.body.composedTitle,
      data : req.body.composedData
    })
    Day.insertMany([newDay]);
    res.redirect("/");
  }else{
    res.send("You have entered wrong password")
  }
});

app.get('/posts/:topic',function(req,res){
  let tar=_.lowerCase(req.params.topic);
  Day.findOne({title:tar},function(err,foundItem){
    if(err){
      console.log(err);
    }else{
      res.render('post.ejs',{post:foundItem})
    }
  })
})

app.get('/delete',function(req,res){
  res.render('delete.ejs');
})

app.post("/delete",function(req,res){
  let pass=req.body.passwordEntered;
  if(pass==AdminPassword){
    let titleDel=req.body.titleToDelete;
    Day.deleteOne({title:titleDel}).then(function(){
      console.log("Data deleted"); // Success
      res.redirect("/");
    }).catch(function(error){
      console.log(error); // Failure
    })
  }else{
    res.send("You have entered wrong password");
  }
});

app.post('/login',function(req,res){
  let passwordEntered=req.body.passEntered;
  if(passwordEntered==AdminPassword){
    authenticated=true;
  }
  res.redirect('/');  
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
