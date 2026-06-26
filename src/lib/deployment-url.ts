export const PRODUCTION_SITE_URL = "https://forex-resignal.vercel.app";
export const MT5_JOURNAL_API_PATH = "/api/mt5/journal";
export const DEFAULT_MT5_JOURNAL_API_URL = `${PRODUCTION_SITE_URL}${MT5_JOURNAL_API_PATH}`;

export function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

export function getConfiguredSiteUrl() {
  const configured =
    process.env.JOURNAL_API_BASE_URL?.trim() ||
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "";

  if (configured) {
    return normalizeBaseUrl(configured).replace(/\/api\/mt5\/journal$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${normalizeBaseUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL)}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${normalizeBaseUrl(process.env.VERCEL_URL)}`;
  }

  return PRODUCTION_SITE_URL;
}

export function getConfiguredMt5JournalApiUrl() {
  const configured = process.env.MT5_JOURNAL_API_URL?.trim() || "";

  if (configured) {
    const normalized = normalizeBaseUrl(configured);
    return normalized.endsWith(MT5_JOURNAL_API_PATH)
      ? normalized
      : `${normalized}${MT5_JOURNAL_API_PATH}`;
  }

  return `${getConfiguredSiteUrl()}${MT5_JOURNAL_API_PATH}`;
}
