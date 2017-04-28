// all hail the oxford comma
module.exports = function (list) {
  if (list.length === 0) return '';
  if (list.length === 1) return String(list[0]);
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  // for when list has more than 2 items, we start punctuating with comma
  var punctuated = '';
  for (var i = 0; i < list.length - 1; i++) {
    punctuated += `${list[i]}, `;
  }
  punctuated += `and ${list[list.length - 1]}`; 
  return punctuated;
}
