'use strict';
var chai = require('chai');
var DataHelper = require('../helper');
var expect = chai.expect;
var testData = require('../sample_data/data.json');

chai.config.includeStack = true;

describe('DataHelper', function() {
  var helper = new DataHelper();

  describe('#getNews', function() {
    context('get news', function() {

      it('can get all articles back correctly', function () {
        var testData= {
            "status": "ok",
            "source": "bloomberg",
            "sortBy": "top",
          "articles": [
          {
            "author": "Max Abelson",
            "title": "Vote for Goldman: America’s Next & &&  > < Top Party",
            "description": "Disgusted in New Jersey? Sad in South Carolina? Democrats test the popular appeal of former financiers.",
            "url": "https://www.bloomberg.com/news/features/20170619/voteforgoldmanbankerstrytorideanantitrumpwave",
            "urlToImage": "https://assets.bwbx.io/images/users/iqjWHBFdfxIU/i8eURVN6QljA/v0/1x1.jpg",
            "publishedAt": "20170619T08:00:06.856Z"
          }
        ]
      };
          var articles = helper.formatResponse(testData);
          expect(articles.length).to.be.above(100);
          console.log(articles);
      });

      it('can get all sources', function () {
        var text = helper.getSourceListText();
        expect(text.length).to.be.above(10);
      });

      it('can get all sections', function () {
        var text = helper.getCategories();
        expect(text.length).to.be.above(10);
      });

      it('can check if a source is available', function () {
        var available = helper.isNewsSourceAvailable('bbc');
        expect(available).to.equal(false);
        available = helper.isNewsSourceAvailable('Google News');
        expect(available).to.equal(true);
      });

      it('can get the correct news source by category', function () {
        var src = helper.getNewsSourceForCategory('music');
        expect(src.length).to.be.above(0);
      });

      it('can get the correct news source by category', function () {
        var src = helper.getNewsSourceForCategory('something');
        expect(src).to.equal(null);
      });

      it('can get the correct news source by category', function () {
        var src = helper.getNewsSourceForCategory('science and nature');
        expect(src).to.equal('National Geographic');
      });

      it('can get news source api para', function () {
        var src = helper.getApiSrcParam('Washington post');
        expect(src).to.equal('the-washington-post');
      });
    });
  });
});