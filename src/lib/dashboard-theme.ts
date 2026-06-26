export type DashboardTheme = "dark" | "light";

export const DASHBOARD_THEME_COOKIE_KEY = "signalmax_dashboard_theme";
export const DASHBOARD_THEME_STORAGE_KEY = "signalmax-dashboard-theme";

export function parseDashboardTheme(value: string | null | undefined): DashboardTheme {
  return value === "light" ? "light" : "dark";
}
