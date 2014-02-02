var _ = require('lodash');

module.exports.register = function (Handlebars, options, params)  {

  var recentLimit = 3;

  function newsPages() {
    return _(options.pages).
      filter(function(page) { return page.layout == 'news.hbs' }).
      filter(function(page) { return !page.data.hideFromIndex }).
      sortBy(function(page) { return page.date });
  }

  function recentNewsPages() {
    return newsPages().splice(0, recentLimit);
  }

  function teamMemberForName(name) {
    return _(options.data.team).
      find(function(member) { return name == member.name; });
  }

  Handlebars.registerHelper('eachNewsItem', function (helperOptions)  {
    return newsPages().map(helperOptions.fn).join('');
  });

  Handlebars.registerHelper('eachRecentNewsItem', function (helperOptions)  {
    return recentNewsPages().map(helperOptions.fn).join('');
  });

  Handlebars.registerHelper('ifMoreNewsItem', function (helperOptions)  {
    if (newsPages().length > recentLimit)
      return helperOptions.fn(this);
  });

  Handlebars.registerHelper('newsAuthor', function (helperOptions)  {
    var author = teamMemberForName(this.page.author);
    return helperOptions.fn(author);
  });

};
