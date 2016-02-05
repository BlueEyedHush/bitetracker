/**
 * Recipe model events
 */

'use strict';

import {EventEmitter} from 'events';
var Recipe = require('./recipe.model');
var RecipeEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
RecipeEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Recipe.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    RecipeEvents.emit(event + ':' + doc._id, doc);
    RecipeEvents.emit(event, doc);
  }
}

export default RecipeEvents;
