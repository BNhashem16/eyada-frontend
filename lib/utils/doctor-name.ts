// Doctor names from the backend often (not always) already start with the
// localized doctor prefix ("د." in Arabic, "Dr." or "Dr" in English). Naively
// rendering `${prefix} ${fullName}` produces duplicates like "د. د. كريم".
//
// `formatDoctorName` returns the name with exactly one prefix, regardless of
// whether the backend included one.

const PREFIX_PATTERN = /^\s*(?:د\.?|دكتور(?:ة)?|dr\.?)\s+/i;

export function stripDoctorPrefix(name: string | null | undefined): string {
  if (!name) return "";
  return name.replace(PREFIX_PATTERN, "").trim();
}

export function formatDoctorName(
  name: string | null | undefined,
  prefix: string,
): string {
  const bare = stripDoctorPrefix(name);
  if (!bare) return "";
  return `${prefix} ${bare}`;
}
