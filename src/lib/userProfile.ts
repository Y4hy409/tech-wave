export type SessionUser = {
  name: string;
  role: "resident" | "admin" | "staff";
  phone?: string;
};

const USER_KEY = "fixora_session_user";

export function readSessionUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function writeSessionUser(user: SessionUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function formatDisplayName(input: string): string {
  const normalized = input.replace(/[_-]+/g, " ").trim();
  if (!normalized) return "Resident User";
  return normalized
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

