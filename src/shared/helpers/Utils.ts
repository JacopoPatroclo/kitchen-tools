export function distinct<T = any>(
  list: T[],
  serialize = (a: { toString: () => string }) => a.toString()
): T[] {
  const pivot: T[] = [];
  const mem = new Map();
  for (let index = 0; index < list.length; index++) {
    const element = list[index];
    const key = serialize(element);
    if (!mem.has(key)) {
      pivot.push(element);
      mem.set(key, true);
    }
  }
  return pivot;
}

export function extractEnv(val: string = "") {
  const regEx = /^\$env{(.*)}$/;
  const results = regEx.exec(val);
  if (results) {
    return results.length > 1 ? results[1] : null;
  }
  return null;
}

export function parseWithEnv(val: string = "") {
  const envName = extractEnv(val);
  return envName && process.env[envName] ? process.env[envName] : val;
}
