// TODO use test runner to automate this test

const findBandName = require('./lib/findBandName');
const punctuateList = require('./lib/punctuateList');
const text = 'This is a very good news, everyone!';

console.log(findBandName(text)); // should log [ 'Very Good News' ]
global.punctuateList = punctuateList;
global.MuteController = require('./lib/muteController');
