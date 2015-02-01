var bz = require("bz"),
    irc = require("irc"),
    https = require("https"),
    config = require("./config");

if (module.parent) {
  return;
}

var bot = new irc.Client(config.server, config.botName, {
  channels: config.channels,
  port: config.port,
  secure: config.secure,
});

var bugzilla = bz.createClient();


// Get a specific bug's summary & link
function bugSummary(from, to, bugID) {
  bugzilla.getBug(bugID, function(error, bug) {
    if (!error) {
      var summary = from + ": Bug " + bug.id + " - " + bug.summary + " http://bugzil.la/" + bug.id + " - " + "Assigned To: " + bug.assigned_to.real_name;
      bot.say(to, summary);
    }
  });
}

// Get bug list from search criteria, count and URL
function bugCountList(from, to, search) {
  bugzilla.searchBugs(search, function(error, bugs) {
    if (error) {
      console.log(error);
      return;
    }

    bot.say(to, from + ": There are " + bugs.length + " public bugs for that request.");
    var url = "https://bugzilla.mozilla.org/buglist.cgi?" + bugzilla.urlEncode(search);
    bot.say(to,  "LINK: " + url);

    return;
  });
}

bot.addListener("message", function(from, to, message) {
  if (message.indexOf(bot.nick) === 0) {
    if (message.split(/[, ]+/).length === 1){
      bot.say(to, "Hi!  What do you need?");
      return;
    }
  }

  if (message.indexOf(bot.nick) !== 0) {
    return;
  }
  
  if (message.indexOf("bug") > -1) {
    console.log("BugID: " + message.split(/[, ]+/).pop());
    var bugID = message.split(/[, ]+/).pop();
    bugSummary(from, to, bugID);
    return;
  }

  if (message.indexOf("own") > -1) {
    var user = "";
    if (message.split(/[, ]+/).length > 2) {
        var user = message.split(/[, ]+/).pop() + ": ";
    }
    bot.say(to, user + "Release owners listed at https://wiki.mozilla.org/Release_Management/Release_owners");
    return;
  }

  // link to the public calendar of merge & release dates
  if (message.indexOf("cal") > -1) {
    bot.say(to, from + ": Release & Merge Day calendar http://bit.ly/1DlbjVc");
    return;
  }

  // link to the release manager calendar (more detailed)
  if (message.indexOf("sched") > -1) {
    bot.say(to, from + ": Release Schedule calendar http://bit.ly/1uQbPWI");
    return;
  }

  // count & url for bugs tracking_$version: + 
  // TODO: verification of version number (validation of digit)
  if (message.indexOf("track") > -1) {
    // TODO: esr needs a _ in front, eg: cf_status_firefox_esr31
    var version = message.split(/[, ]+/).pop();
    var tracking = "cf_tracking_firefox" + version
    var status = "cf_status_firefox" + version
    // For a specific version, in general
    var searchParams = {
      "field0-0-0" : status,
      "value0-0-0" : "unaffected,fixed,verified,disabled,wontfix",
      "type0-0-0" : "nowords"
    };
    searchParams[tracking] = "+";
    bugCountList(from, to, searchParams)
    return;
  }

  // count & url for bugs tracking_$version: ?
  if (message.indexOf("nom") > -1) {
    // TODO: esr needs a _ in front, eg: cf_status_firefox_esr31
    var version = message.split(/[, ]+/).pop();
    var tracking = "cf_tracking_firefox" + version
    // For a specific version, in general
    var searchParams = {};
    searchParams[tracking] = "?";
    bugCountList(from, to, searchParams)
    return;
  }

  // tracking XX version, how many assigned to nobody
  if (message.indexOf("nobody") > -1) {
    // TODO: esr needs a _ in front, eg: cf_status_firefox_esr31
    var version = message.split(/[, ]+/).pop();
    var tracking = "cf_tracking_firefox" + version
    var status = "cf_status_firefox" + version

    var searchParams = {
      "field0-0-0" : status,
      "value0-0-0" : "unaffected,fixed,verified,disabled,wontfix",
      "type0-0-0" : "nowords",
      "field1-0-0" : "assigned_to",
      "value1-0-0" : "nobody",
      "type1-0-0" : "substring"
    }

    searchParams[tracking] = "+";
    bugCountList(from, to, searchParams);
    return;
  }

  // latest release notes
  if (message.indexOf("notes") > -1) {
    var notes = "https://www.mozilla.org/firefox/notes\n";
    notes += "https://www.mozilla.org/mobile/notes";

    bot.say(to,from + ": " + notes);
    return;
  }
});
