module.exports.register = function (Handlebars, options, params)  {

  var recentLimit = 3,
      newsLayoutFilename = 'news-item-layout.hbs';

  function newsPages() {
    return options.pages.
      filter(function(page) { return page.data.layout == newsLayoutFilename }).
      filter(function(page) { return !page.data.hideFromIndex }).
      sort(function(a, b)   { return a.data.date - b.data.date }).
      reverse();
  }

  function recentNewsPages() {
    return newsPages().splice(0, recentLimit);
  }

  function teamMemberForName(name) {
    for (var i in options.data.team) {
      var member = options.data.team[i];
      if (member.name == name)
        return member;
    }
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
