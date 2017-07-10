'use strict';
var _ = require('lodash');
const apiKey = 'c62c61c5d9494014b5ffc88abe0004d8';
var rp = require('request-promise');
const ENDPOINT = 'https://newsapi.org/v1/articles';
const categories = [
  "general",
  "technology",
  "sport",
  "business",
  "politics",
  "entertainment",
  "gaming",
  "music",
  "science-and-nature"
];
const SOURCE_List = require('./sample_data/sourceList.json');
const NEWS_SOURCES = require('./sample_data/sources.json');
const shortList = ['economist',
  'guardian',
  'hindu',
  'huffington post',
  'lad bible',
  'new york times',
  'next web',
  'sport bible',
  'telegraph',
  'times of india',
  'verge',
  'wall street journal',
  'washington post'];

function Helper() {

  Helper.prototype.getNews = getNews;
  Helper.prototype.getNewsSourceForCategory = getNewsSourceForCategory;
  Helper.prototype.formatResponse = formatResponse;
  Helper.prototype.getSourceListText = getSourceListText;
  Helper.prototype.getCategories = getCategories;
  Helper.prototype.isNewsSourceAvailable = isNewsSourceAvailable;
  Helper.prototype.getApiSrcParam = getApiSrcParam;

  function getNews(src, sortBy) {

    src = getApiSrcParam(src);
    sortBy = 'top';
    return getNewsFromApi(src, sortBy).then(onFetchDataSuccess);
  }

  function getApiSrcParam(src) {
    src = src.toLowerCase();
    switch (src) {
      case "the guardian":
      case "guardian":
        src = "the-guardian-uk";
        break;
      default:
        console.log('is it short listed', shortList.indexOf(src));
        if (shortList.indexOf(src) >= 0) {

          src = 'the ' + src;
        }

        src = src.replace(/ /g, "-");
        break;
    }
    return src;
  }

  function isNewsSourceAvailable(source) {
    var sources = getSources();
    return sources.indexOf(source.toLowerCase()) >= 0 || shortList.indexOf(source.toLowerCase()) >= 0;
  }

  function getSources() {
    var newsSources = _.cloneDeep(SOURCE_List);
    return _.map(newsSources, function (source) {
      return source.toLowerCase();
    });
  }

  function getSourceListText() {
    var sources = getSources(),
      text = "";
    _.each(sources, function (source) {
      text += '<p>' + source + '</p>';
    });

    return text;
  }

  function getCategories() {
    var text = "";
    _.each(_.uniq(categories), function (src) {
      text += '<p>' + src + '</p>';
    });
    return text;

  }

  function onFetchDataSuccess(response) {
    return formatResponse(response.body);
  }

  function escapeInvalidCharacters(text) {
    if (!text) {
      return '';
    }
    return text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;').replace(/'/g, '&apos;').replace(/"/g, '&quot;');
  }
  function formatResponse(data) {
    var articles = data.articles,
      text = "";


    _.each(articles, function (article) {
      var description =escapeInvalidCharacters(article.description);
      var title = escapeInvalidCharacters(article.title);
      text += '<p>' + title + '<break strength="strong">' + description + '</break></p>'
    });
    return text;
  }

  function getNewsFromApi(src, sortBy) {
    var params = {
      source: src,
      sortBy: sortBy,
      apiKey: apiKey
    };
    var options = {
      method: 'GET',
      qs: params,
      uri: ENDPOINT,
      resolveWithFullResponse: true,
      json: true
    };
    return rp(options);
  }

  function getNewsSourceForCategory(category) {
    var sources = getSourcesByCategory(category);

    return sources && sources.length ? sources[0].name : null;
  }

  function getSourcesByCategory(category, sortBy) {
    var newsSouces = NEWS_SOURCES.sources;
    var sourcesForCategory = _.filter(newsSouces, function (source) {
      category = category.replace(' ', '-').toLowerCase();
      return source.category === category.toLowerCase() && source.language === 'en' && source.country === 'us';
    });

    if (sourcesForCategory.length >= 0) {
      return _.shuffle(sourcesForCategory);
    }
    return null;
  }

}

module.exports = Helper;