'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose')),
    Schema = mongoose.Schema;

var RecipeSchema = new Schema({
  title: String,
  date: {
    type: Date,
    default: Date.now
  },
  ingredients: [{
    name: String,
    qty: Number
  }],
  body: String,
  tags: {
    type: [String],
    index: true
  },
  author: String,
  image: {
    type: String,
    default: 'default.png'
  }
});

export default mongoose.model('Recipe', RecipeSchema);
