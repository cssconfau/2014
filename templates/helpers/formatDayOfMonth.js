var moment = require('moment');

module.exports.register = function (Handlebars, options, params)  {

  // Outputs the ordinal for the given date
  // Examples:
  //
  // {{formatDayOfMonth 2014-04-01}} -> "<span class='day'>1</span><sup class='ord'>st</sup>"
  Handlebars.registerHelper('formatDayOfMonth', function (date)  {
    var plain = moment(date).format('Do'),
        withTags = plain.replace(/(\d+)(.+)/, "<span class='day'>$1</span><sup class='ord'>$2</sup>");
    return new Handlebars.SafeString(withTags);
  });

};
