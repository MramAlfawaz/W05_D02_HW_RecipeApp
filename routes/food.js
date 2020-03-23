const express = require('express')
const mongoose = require('mongoose')
const moment = require('moment')
const methodOR = require('method-override')
const router = express.Router()
const expressLayouts = require('express-ejs-layouts')
const formidable = require('formidable')

const multer = require("multer");
const fs = require("fs");
const path = require("path");
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function(req, file, cb) {
    let fileExtension = path.extname(file.originalname).split(".")[1];
    cb(null, file.fieldname + "-" + Date.now() + "." + fileExtension);
  }
});
var upload = multer({ storage: storage });


// Models
const Food = require('../models/Food')
const Ingredients = require('../models/Ingredients')


router.use(methodOR('_method'))
router.use(expressLayouts);

router.use(express.urlencoded({
    extended: true
}))

router.get('/', (req, res) => {
    Food.find().populate("ingredients").then((foods) => {
        res.render('food/index', {
            foods
        })
    }).catch(err => console.log(`error`, err))
})

router.get('/food/create', (req, res) => {
    Ingredients.find().then((ingredients) => {
        res.render('food/create', {
            ingredients
        })
    })
})

router.post("/food/create", upload.single("filetoupload"), (req, res, next) => {
  console.log(req.body);
  const file = req.file;
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }
  console.log(file.path);
  let food = new Food(req.body);
  food.image = "/uploads/" + file.filename;
  //console.log(author);
  //save author
  food
    .save()
    .then(() => {
      res.redirect("/");
    })
    .catch(err => {
      console.log(err);
      res.send("Error!!!!!");
    });
});

router.delete("/food/:id/delete", (request, response) => {
  Food.findByIdAndDelete(request.params.id).then(food => {
    response.redirect("/");
  });
});

module.exports = router