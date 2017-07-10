'use strict';

var Helper = require("./helper");
var _ = require('lodash');

function IntentHandler() {
  var helper = new Helper();
  var categoryPromptText = "Would you like to hear headlines regarding any of the categories? Just say, music or sport.",
    sourcePromptText = "Would you like to hear headlines from any particular news source or blog. For example, Bloomberg, Business Insider or Buzzfeed.",
    sourceListText = "To hear a list of our available news sources, say Source List";

  var newsFromSourceIntent = {
      "utterances": {
        "slots": {"Source": "LIST_OF_SOURCES"},
        'utterances': ['{Headlines|News Headlines} {from} {-|Source}']
      },
      name: 'newsFromSourceIntent',
      callFunc: getNewsFromSource
    },
    sourceOnlyNewsIntent = {
      "utterances": {
        "slots": {"Source": "LIST_OF_SOURCES"},
        'utterances': ['{|from} {-|Source}']
      },
      name: 'sourceOnlyNewsIntent',
      callFunc: getNewsFromSource
    },
    categoryNewsIntent = {
      "utterances": {
        "slots": {"Category": "LIST_OF_Categories"},
        'utterances': ['{Headlines|News Headlines} {about | on} {-|Category} ']
      },
      name: 'categoryNewsIntent',
      callFunc: getNewsAboutCategory
    },

    sourceListIntent = {
      "utterances": {
        'slots': {},
        'utterances': ['{|List} {Sample sources | Available sources| some sources}']
      },
      name: 'sourceListIntent',
      callFunc: getSourceList
    },
    sourceNameOnlyListIntent = {
      "utterances": {
        'slots': {},
        'utterances': ['{Sources | Source List} ']
      },
      name: 'sourceNameOnlyListIntent',
      callFunc: getSourceList
    },
    categoryListIntent = {
      "utterances": {
        'slots': {},
        'utterances': ['{|List} {|available } {categories}']
      },
      name: 'categoryListIntent',
      callFunc: getCategoryList
    };

  var helpIntent = {
      name: 'AMAZON.HelpIntent',
      utterances: {},
      callFunc: handleHelpIntent
    },
    cancelIntent = {
      name: 'AMAZON.CancelIntent',
      utterances: {},
      callFunc: goodBye
    },
    repeatIntent = {
      name: 'AMAZON.RepeatIntent',
      utterances: {},
      callFunc: handleRepeatIntent
    },
    stopIntent = {
      name: 'AMAZON.StopIntent',
      utterances: {},
      callFunc: goodBye
    },
    yesIntent = {
      name: 'AMAZON.YesIntent',
      utterances: {},
      callFunc: handleYesIntent
    },
    noIntent = {
      name: 'AMAZON.NoIntent',
      utterances: {},
      callFunc: goodBye
    };

  function getNewsFromSource(req, res) {
    var source = req.slot('Source');
    var reprompt = sourcePromptText;

    console.log('Source requested ', source);
    if (_.isEmpty(source)) {
      var prompt = 'I didn\'t hear a source name. Tell me one. For example, Bloomberg, Business Insider or Buzzfeed.';
      res.say(prompt).reprompt(reprompt).shouldEndSession(false);
      return res.send();
    }

    if (!helper.isNewsSourceAvailable(source)) {
      var prompt = 'Sorry, currently we do not have ' + source + '. Please choose another source. ' + sourceListText;
      var reprompt = sourceListText;
      res.say(prompt).reprompt(reprompt).shouldEndSession(false);
      createCard(prompt, res);
      return res.send();
    }

    setCurrentSession(res, {source: source});
    return getNews(req, res);
  }

  function getNewsAboutCategory(req, res) {
    var category = req.slot('Category'),
      reprompt = category;
    console.log('category requested ', category);

    if (_.isEmpty(category)) {
      var prompt = 'I didn\'t hear a category. Tell me one. For example, music, sport or general';
      res.say(prompt).reprompt(reprompt).shouldEndSession(false);
      res.send();
      return true;
    }
    var src = helper.getNewsSourceForCategory(category);
    if (!src) {
      var text = 'Oh, sorry, I cannot find anything about ' + category + '.';
      text += ' Please pick from one of the following ' + helper.getCategories() + reprompt;
      res.say(text).reprompt(reprompt).shouldEndSession(false);
      res.send();
      return true;
    }
    setCurrentSession(res, {source: src});
    return getNews(req, res);
  }

  function getSourceList(req, res) {
    var sourceText = helper.getSourceListText();
    var text = sourceText +  '<p>' + sourcePromptText + '</p>';
    setCurrentSession(res, {enquiry: 'source', repeatText: sourceText});
    res.say(text).reprompt(sourcePromptText).shouldEndSession(false);
  }

  function getCategoryList(req, res) {
    var categories = helper.getCategories();
    var response = categories + '<p>' + categoryPromptText + '</p>';
    setCurrentSession(res, {enquiry: 'category', repeatText: categories});
    res.say(response).reprompt(categoryPromptText).shouldEndSession(false);
  }

  function goodBye(req, res) {
    var goodBye = 'Thank you. Good bye!';

    res.say(goodBye).shouldEndSession(true);
  }

  function handleYesIntent(req, res) {
    var current = res.session('current');
    var enquiry = current.enquiry;

    if (enquiry === 'category') {
      res.say(categoryPromptText).reprompt(categoryPromptText).shouldEndSession(false);
    } else {
      res.say(sourcePromptText).reprompt(sourcePromptText).shouldEndSession(false);
    }
  }

  function handleHelpIntent(req, res) {
    var speechText = "For news headlines from a special source, for example, Hacker News, please say: News from Hacker News. Or simply: Hacker News. ";
    var repromptText = sourcePromptText;
    setCurrentSession(res, {repeatText: speechText});
    res.say(speechText).reprompt(repromptText).shouldEndSession(false);
  }

  function handleRepeatIntent(req, res) {
    var session = getCurrentSessions(res);
    var repeatText =  _.get(session, 'repeatText', '');
    var enquiry = _.get(session, 'enquiry', '');
    var repromptText = enquiry === 'category'? categoryPromptText: sourcePromptText;
    if (repeatText) {
      res.say(repeatText).reprompt(repromptText).shouldEndSession(false);
    } else {
      handleLaunchRequest();
    }
  }

  function setCurrentSession(res, info) {
    res.session('current', info);
  }

  function getCurrentSessions(res) {
    return res.session('current');
  }

  function getNews(req, res) {
    var session = getCurrentSessions(res);
    var source = _.get(session, 'source', '');
    helper.getNews(source).then(function (data) {
      console.log('getting data back now', data.substr(0, 100));
      res.say(data);
      createCard('News from ' + source, res);
      res.send();
    }).catch(function (error) {
      console.log('heck, not getting the data', error);
      handleGetNewsFailure(error, req, res);
    });
    return false;
  }

  function handleGetNewsFailure(error, req, res) {

    var session = getCurrentSessions(res);
    var source = _.get(session, 'source', '');
    res.say('Sorry we have a little trouble getting headlines from ' + source + '. Please check back later. Goodbye! ');
    res.shouldEndSession(true);
    res.send();
  }

  function createCard(text, res) {
    res.card({
      type: "Simple",
      title: "News Feed",
      content: text
    });
  }

  function handleLaunchRequest(req, res) {
    var prompt = 'Please tell me the name of the source you would like to hear the news headlines from. You can say CNN, Google News or ESPN. ';
    prompt += sourceListText;
    setCurrentSession(res, {repeatText: prompt, enquiry: 'source'});
    res.say(prompt).reprompt(prompt).shouldEndSession(false);
  }

  return {
    newsFromSourceIntent: newsFromSourceIntent,
    sourceOnlyNewsIntent: sourceOnlyNewsIntent,
    categoryNewsIntent: categoryNewsIntent,
    sourceListIntent: sourceListIntent,
    sourceNameOnlyListIntent: sourceNameOnlyListIntent,
    categoryListIntent: categoryListIntent,
    yesIntent: yesIntent,
    noIntent: noIntent,
    helpIntent: helpIntent,
    cancelIntent: cancelIntent,
    repeatIntent: repeatIntent,
    stopIntent: stopIntent,
    handleLaunchRequest: handleLaunchRequest
  };
}

module.exports = IntentHandler;