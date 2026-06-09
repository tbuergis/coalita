export function toAsciiSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue")
    .replace(/à|á|â/g, "a").replace(/è|é|ê/g, "e")
    .replace(/[^a-z0-9]/g, "");
}

export function buildUsername(firstName: string, lastName: string, suffix?: string): string {
  const base = `${toAsciiSlug(firstName)}.${toAsciiSlug(lastName)}`;
  return suffix ? `${base}.${suffix}` : base;
}
