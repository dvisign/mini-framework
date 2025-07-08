export function formatDate(date) {
  if (!(date instanceof Date)) return "";
  const pad = (n) => n.toString().padStart(2, "0");

  const yyyy = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());

  return `${yyyy}-${MM}-${dd}`;
}

export function formatTime(date) {
  if (!(date instanceof Date)) return "";
  const pad = (n) => n.toString().padStart(2, "0");

  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());

  return `${hh}:${mm}:${ss}`;
}
