export function rgbaStringToArray(rgbString) {
  const match = /^rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})(?:, ?(\d{1,3}))?\)$/.exec(rgbString);

  if (!match) return match;

  return match.slice(1).map(str => parseInt(str, 10));
}

/*
 * Determine if color is 'dark'
 * Dark color will make white text more visible and vice versa for black
 * From: http://www.nbdtech.com/Blog/archive/2008/04/27/Calculating-the-Perceived-Brightness-of-a-Color.aspx
 */

export function isColorDark(r, g, b) {
  return Math.sqrt(
    ((r ** 2) * 0.241) +
    ((g ** 2) * 0.691) +
    ((b ** 2) * 0.068),
  ) < 130;
}
