function escapeTicks(string) {
  return String(string).replace(/'/g, "\\'");
}

// Generate curl string for Bash from HTML5 fetch input
export default function fetchToCurl(init) {
  if (!init) return null;

  const {
    method,
    url,
    redirect,
    body,
    headers,
  } = init;

  let result = 'curl';

  result += ` -X$'${escapeTicks(method)}'`;
  result += redirect === 'follow' ? ' -L' : '';

  if (headers instanceof window.Headers) {
    headers.forEach((value, name) => {
      result += ` -H$'${escapeTicks(name)}: ${escapeTicks(value)}'`;
    });
  }

  if (body) {
    result += ` -d$'${escapeTicks(body)}'`;
  }

  result += ` $'${escapeTicks(url)}'`;

  return result;
}
