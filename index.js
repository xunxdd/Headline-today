/*
 News Reader: v 0.0.3
 -- try to see why no news returned

 */

var alexa = require('alexa-app');

var app = new alexa.app('news-reader');

var intentHandler = require('./intent_handler');
var _ = require('lodash');

var IntentHandler = new intentHandler();

var intents = [
  IntentHandler.newsFromSourceIntent,
  IntentHandler.categoryNewsIntent,
  IntentHandler.sourceOnlyNewsIntent,
  IntentHandler.sourceListIntent,
  IntentHandler.sourceNameOnlyListIntent,
  IntentHandler.categoryListIntent,
  IntentHandler.yesIntent,
  IntentHandler.noIntent,
  IntentHandler.helpIntent,
  IntentHandler.cancelIntent,
  IntentHandler.repeatIntent,
  IntentHandler.stopIntent
];

app.launch(function (req, res) {
  return IntentHandler.handleLaunchRequest(req, res);
});

_.each(intents, function (intent) {
  //console.log(intent);
  app.intent(intent.name, intent.utterances, function (req, res) {
    return intent.callFunc(req, res);
  });
});

module.exports = app;
