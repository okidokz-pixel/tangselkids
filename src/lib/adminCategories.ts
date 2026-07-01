// Canonical descriptor for the 9 place categories, shared by the draft feature
// and the dashboard. `route` is the /admin/<route> URL segment (also stored as a
// draft's `category`); `table` is the Supabase table; `label` is the Indonesian
// display name.

export type AdminCategory = { route: string; table: string; label: string };

export const ADMIN_CATEGORIES: AdminCategory[] = [
  { route: "schools",          table: "schools",          label: "Sekolah" },
  { route: "learning-centers", table: "learning_centers", label: "Tempat Kursus" },
  { route: "daycares",         table: "daycares",         label: "Daycare" },
  { route: "playgrounds",      table: "playgrounds",      label: "Playground" },
  { route: "clinics",          table: "clinics",          label: "Klinik" },
  { route: "cafes",            table: "cafes",            label: "Kafe" },
  { route: "mini-zoo",         table: "mini_zoo",         label: "Mini Zoo" },
  { route: "swimming-pools",   table: "swimming_pools",   label: "Kolam Renang" },
  { route: "bookstores",       table: "bookstores",       label: "Toko Buku" },
];

export const ADMIN_CATEGORY_LABEL: Record<string, string> =
  Object.fromEntries(ADMIN_CATEGORIES.map((c) => [c.route, c.label]));
