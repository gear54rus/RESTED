function padTime(number) {
  return String(number < 10 ? `0${number}` : number);
}

export function secondsToMMSS(seconds) {
  return `${padTime(Math.floor(seconds / 60))}:${padTime(seconds % 60)}`;
}

export function timeHMS(date) {
  return `${padTime(date.getHours())}:${padTime(date.getMinutes())}:${padTime(date.getSeconds())}`;
}
