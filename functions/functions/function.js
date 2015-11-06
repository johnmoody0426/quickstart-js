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

// Makes all new messages ALL UPPERCASE.
exports.uppercaser = function(context, data) {
  // Read the Firebase DB entry that triggered the function.
  console.log('Loading firebase path: ' + config.firebaseDbUrl + data.path);
  var newMessageRef = new Firebase(config.firebaseDbUrl + data.path);
  newMessageRef.once('value', function(data) {
    var message = data.val().message;
    if (message != message.toUpperCase()) {
      // Saving uppercased message to DB.
      newMessageRef.update({message: message.toUpperCase()}, function (error) {
        error ? context.done(error) : context.done();
      });
    } else {
      context.done();
    }
  }, function(error) {
    context.done(error);
  });
};
