'use strict';
var NB = NB || {};

NB.StoryModel = (function() {
  var StoryModel = {};

  /*  --  Story methods  --  */
  function rdtVote(upOrDown) {
    var data = {
      upOrDown: upOrDown,
      id: StoryModel.panelStory.raw._id,
      sourceId: StoryModel.panelStory.raw.sourceId
    };

    StoryModel.panelStory.userVote(upOrDown);

    $.post('/api/reddit/vote', data, function(res) {
      if (res.err) {
//         alert(res);
      }
    });

  }

  function init() {
    //TODO these really should inherit from a common parent.
//     StoryModel.tooltipStory = {
//       raw: {},
//       name: ko.observable(),
//       url: ko.observable(),
//       sourceUrl: ko.observable(),
//       authorUrl: ko.observable(),
//       domain: ko.observable(),
//       category: ko.observable(),
//       color: ko.observable(),
//       author: ko.observable(),
//       commentCount: ko.observable(),
//       score: ko.observable(),
//       timeString: ko.observable(),
//       dateString: ko.observable(),
//       isFav: ko.observable(false)
//     };

    StoryModel.panelStory = {
      raw: {},
      name: ko.observable(),
      shortName: ko.observable(),
      url: ko.observable(),
      sourceUrl: ko.observable(),
      authorUrl: ko.observable(),
      domain: ko.observable(),
      category: ko.observable(),
      color: ko.observable(),
      author: ko.observable(),
      commentCount: ko.observable(),
      score: ko.observable(),
      timeString: ko.observable(),
      dateString: ko.observable(),
      content: ko.observable(''),
      isFav: ko.observable(false),
      userVote: ko.observable(''),
      upVote: function() {
        if (this.currentStory.userVote() !== 'up') { //'this' refers to NB.App
          rdtVote('up');
        } else {
          rdtVote('');
        }
      },
      downVote: function() {
        if (this.currentStory.userVote() !== 'down') { //'this' refers to NB.App
          rdtVote('down');
        } else {
          rdtVote('');
        }
      }
    };
  }

  //Code here should normalize data from different sources.
  //Anything else (like comment URLS) should be done on the server at time of processing.
  StoryModel.setCurrentStory = function(story) {
//     var storyObj = StoryModel[tooltipOrPanel + 'Story'];
    var storyObj = StoryModel.panelStory;
    var dateFormatter = d3.time.format('%a, %-e %b %Y');
    var timeFormatter = d3.time.format('%-I:%M%p');
    var domain
      , url = story.url
      , sourceUrl
      , authorUrl;
    var name = story.name;
    var shortName = story.name;
    var category = story.category || '';
    var isFav = NB.Favs.isFav(story);
    var color = NB.Settings.getColor(story.source, category);


    if (story.source === 'rdt') {
      domain = story.rdt.domain;
      //From 24 sep 2014 the source and author URLs are in the database.
      sourceUrl = story.sourceUrl || 'https://www.reddit.com' + story.rdt.permalink;
      authorUrl = story.authorUrl || 'http://www.reddit.com/user/' + story.author;
    }
    if (story.source === 'hxn') {
      sourceUrl = story.sourceUrl || 'https://news.ycombinator.com/item?id=' + story.sourceId;
      authorUrl = story.authorUrl || 'https://news.ycombinator.com/user?id=' + story.author;
      if (!story.url) {
        url = sourceUrl;
      }
      if (story.name.toLowerCase().indexOf('show hn') > -1) {
        domain = 'Show HN';
        name = name.replace('Show HN: ', '');
      } else if (story.name.toLowerCase().indexOf('ask hn') > -1) {
        domain = 'Ask HN';
        url = sourceUrl;
        name = name.replace('Ask HN: ', '');
      } else {
        var urlTest = story.url.match(/:\/\/([^\/]*)/);
        if (urlTest) {
          domain = urlTest[1] ? urlTest[1] : 'HN'; //TODO: what?
        } else {
          domain = 'Hacker News';
        }
      }
    }

    if (name.length > 50) {
      shortName = name.substr(0, 47).trim() + '...';
    }

    storyObj.raw = story;

    storyObj
      .name(name)
      .shortName(shortName)
      .url(url)
      .sourceUrl(sourceUrl)
      .authorUrl(authorUrl)
      .domain(domain)
      .category(category)
      .color(color)
      .author(story.author)
      .commentCount(story.commentCount)
      .score(Math.round(story.score))
      .timeString(timeFormatter(story.postDate))
      .dateString(dateFormatter(story.postDate))
      .isFav(isFav);


//     if (tooltipOrPanel === 'panel') {
        storyObj //TODO move up three lines
        .content(story.content)
        .userVote(story.vote);
//     }
  };

  function clear() {
    StoryModel.panelStory
      .name('')
      .url('')
      .sourceUrl('')
      .authorUrl('')
      .domain('')
      .category('')
      .color('')
      .author('')
      .commentCount('')
      .score('')
      .timeString('')
      .dateString('')
      .content('')
      .isFav('')
      .userVote('');
  }


  //TODO move the rest of the 'exports' stuff down here
  StoryModel.clear = clear;

  init();
  return StoryModel;
})();