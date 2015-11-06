/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Firebase = require('firebase');
var config = require('./config.json');
var StringUtils = require('./string-utils.js');
StringUtils.loadModeratorStringUtils();

// Moderators messages by lowering all uppercase characters
exports.moderator = function(context, data) {
  // Read the Firebase DB entry that triggered the function.
  console.log('New message with path: ' + data.path);
  console.log('Loading firebase: ' + config.firebaseDbUrl + data.path);
  var newMessageRef = new Firebase(config.firebaseDbUrl + data.path);
  newMessageRef.once('value', function(data) {
    console.log('Read message content: ' + JSON.stringify(data.val()));
    var firebaseEntryValues = data.val();
    var message = firebaseEntryValues.message;
    // Stop if the message has already been moderated. We need this until we can
    // filter Cloud Functions by "child_created" events only.
    // TODO: Remove this when we can filter on "child_created" events.
    if (firebaseEntryValues.moderated) {
      return context.done();
    }
    // Moderate if the user is Yelling.
    if (message.isYelling()) {
      console.log('User is yelling. moderating...');
      message = message.capitalizeSentence();
      firebaseEntryValues.moderated = true;
    }
    // Moderate if the user uses SwearWords.
    var moderated = message.moderateSwearWords();
    if (message != moderated) {
      console.log('User is swearing. moderating...');
      message = moderated;
      firebaseEntryValues.moderated = true;
    }
    // If message has just been moderated we update the Firebase DB.
    if(firebaseEntryValues.moderated) {
      firebaseEntryValues.message = message;
      console.log('Message has been moderated. Saving to DB: ' +
        JSON.stringify(firebaseEntryValues));
      // TODO: Authorize when we can use custom auth on GCF.
      newMessageRef.update(firebaseEntryValues, function (error) {
        error ? context.done(error) : context.done();
      });
    } else {
      context.done();
    }
  }, function(error) {
    context.done(error);
  });
};
