var Botkit = require('botkit');
var findBandName = require('./lib/findBandName');
var punctuateList = require('./lib/punctuateList');

if (!process.env.SLACK_BOT_TOKEN) {
  console.log('Error: Specify SLACK_BOT_TOKEN in environment');
  process.exit(1);
}

var controller = Botkit.slackbot({
 debug: false
});

controller.spawn({
  token: process.env.SLACK_BOT_TOKEN
}).startRTM(function(err) {
  if (err) {
    throw new Error(err);
  }
});

controller.on('ambient', onAmbient);
function onAmbient(bot, message) {
  if (!message.text) return;
  var names = findBandName(message.text);
  if (names.length === 0) return;
  // message for just one band name
  if (names.length === 1) {
    bot.replyInThread(message, `You know, "${names[0]}" could be a pretty good band name.`);
  } else {
    // message for multiple
    var namesWithQuotes = names.map(el => `"${el}"`);
    bot.replyInThread(message, `You know, ${punctuateList(namesWithQuotes)} could all be pretty good band names.`);
  }
  for (var i = 0; i < names.length; i++) {
  }
}
