export function compile(template, state) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => state[key] ?? "");
}
