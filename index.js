var Botkit = require('botkit');
var winston = require('winston');
var findBandName = require('./lib/findBandName');
var MuteController = require('./lib/muteController');
var punctuateList = require('./lib/punctuateList');
var commonKeywords = require('./lib/commonKeywords');

if (!process.env.SLACK_BOT_TOKEN) {
  console.log('Error: Specify SLACK_BOT_TOKEN in environment');
  process.exit(1);
}

var controller = Botkit.slackbot({
  logger: new winston.Logger({
    levels: winston.config.syslog.levels,
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({
        filename: './logs/band-name.exe.log',
        maxsize: 1024*1024, // rotate at 1mb
      }),
    ],
  }),
});

controller.spawn({
  token: process.env.SLACK_BOT_TOKEN
}).startRTM(function(err) {
  if (err) {
    throw new Error(err);
  }
});

var muteController = new MuteController();

controller.on('ambient', onAmbient);
function onAmbient(bot, message) {
  if ( muteController.hasMuted(message.channel) ) return;
  
  if (!message.text) return;
  var names = findBandName(message.text);
  if (names.length === 0) return;
  
  var reply = '';
  // message for just one band name
  if (names.length === 1) {
    reply = `You know, "${names[0]}" could be a pretty good band name.`;
  } else {
    // message for multiple
    var namesWithQuotes = names.map(el => `"${el}"`);
    reply = `You know, ${punctuateList(namesWithQuotes)} could all be pretty good band names.`;
  }
  bot.startTyping(message);
  setTimeout(() => { bot.replyInThread(message, reply); }, 1000 * names.length);
}

controller.hears(commonKeywords.help, ['direct_mention'], sendHelp);
function sendHelp(bot, message) {
  bot.reply(message, 'Howdy! I am just here to find band names for my band.');
}

controller.hears(['unmute'], ['direct_mention'], unmute);
function unmute(bot, message) {
  muteController.unmute(message.channel);
  bot.api.reactions.add({
    timestamp: message.ts,
    channel: message.channel,
    name: 'bow',
  }, function(err, res) {
    if (err) {
        bot.botkit.log('Failed to add emoji reaction :(', err);
    }
  });
}

// mute temporarily
controller.hears([...commonKeywords.stop, 'mute'], ['direct_mention'], mute);
function mute(bot, message) {
  bot.replyWithTyping(message, `I am sorry <@${message.user}>. I will keep my mouth shut for a while. If you don't want me around this channel, feel free to kick me out.`);
  muteController.mute(message.channel);
}
