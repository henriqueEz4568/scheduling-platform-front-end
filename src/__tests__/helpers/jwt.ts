function base64Url(value: object) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

/** Unsigned test JWT; only the payload matters for these tests. */
export function createJwt(payload: object) {
  return `${base64Url({ alg: "HS256", typ: "JWT" })}.${base64Url(payload)}.signature`;
}

export function secondsFromNow(seconds: number, now = Date.now()) {
  return Math.floor(now / 1000) + seconds;
}
