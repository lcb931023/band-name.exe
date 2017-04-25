const nlp = require('nlp_compromise');
const utils = require('./utils');

module.exports = function (text) {
  let arrBandNames = [];
  let nlpText = nlp.text(text);
  nlpText.sentences.forEach(function(sent) {
    let tags = sent.tags();
    let newBandNames = twoWordSameFirstLetter(sent, tags).concat(threeWordAdvAdjNoun(sent, tags));
    newBandNames = newBandNames.filter(sanitizeBandName);
    // accumulate results
    arrBandNames = arrBandNames.concat(newBandNames);
  });
  return arrBandNames;
}

// Filter the bad results, that include emoji, broken sentences, or links
function sanitizeBandName(name) {
  var pass = true;
  // - anything that contains `<`
  if (name.indexOf('<') !== -1) pass = false;
  // - anything that contains `:` in the middle
  if (name.slice(1, -1).indexOf(':') !== -1) pass = false;
  // - anything that contains `,` in the middle
  if (name.slice(1, -1).indexOf(',') !== -1) pass = false;
  // - anything that contains `…` in the middle
  return pass;
}

// adv + adj + noun
function threeWordAdvAdjNoun(sent, tags) {
  let arrBandNames = [];
  let nounIndexes = [];
  for (var i = 2; i < tags.length; i++) {
    if (tags[i] === 'Noun') {
      nounIndexes.push(i);
    }
  }
  // Check if the tags before noun matches pattern
  nounIndexes = nounIndexes.filter(function(nounIndex) {
    let advTag = tags[nounIndex-2];
    let adjTag = tags[nounIndex-1];
    return advTag === 'Adverb' && adjTag === 'Adjective';
  });
  // Conjure band names with the remaining nouns + their preceding adv+adj
  nounIndexes.forEach(function(nounIndex) {
    let bandName =  utils.capitalize(sent.terms[nounIndex-2].text) + ' ' +
                    utils.capitalize(sent.terms[nounIndex-1].text) + ' ' +
                    utils.capitalize(sent.terms[nounIndex].text);
    arrBandNames.push(bandName);
  });
  return arrBandNames;
}
// (adv/adj) + noun, with 1st letter matching
function twoWordSameFirstLetter(sent, tags) {
  let arrBandNames = [];
  let nounIndexes = [];
  for (var i = 1; i < tags.length; i++) {
    if (tags[i] === 'Noun') {
      nounIndexes.push(i);
    }
  }
  // Check if the tags before noun matches pattern
  nounIndexes = nounIndexes.filter(function(nounIndex) {
    let prevTag = tags[nounIndex-1];
    return prevTag === 'Adjective' || prevTag === 'Adverb';
  });
  // Check if the two words have same first char
  nounIndexes = nounIndexes.filter(function(nounIndex) {
    return sent.terms[nounIndex].text[0].toLowerCase() === sent.terms[nounIndex-1].text[0].toLowerCase();
  });
  // Conjure band names with the remaining nouns + their preceding adv+adj
  nounIndexes.forEach(function(nounIndex) {
    let bandName =  utils.capitalize(sent.terms[nounIndex-1].text) + ' ' +
                    utils.capitalize(sent.terms[nounIndex].text);
    arrBandNames.push(bandName);
  });
  return arrBandNames;
}
