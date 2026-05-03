const STORAGE_KEY = "facilityNotes";

export type FacilityNote = {
  placeId: string;
  placeName: string;
  placeCategory: string;
  placeIcon: string;        // emoji icon for the place
  noteText: string;
  updatedAt: string;        // ISO string
};

function load(): FacilityNote[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function save(notes: FacilityNote[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function getNote(placeId: string): FacilityNote | undefined {
  return load().find(n => n.placeId === placeId);
}

export function getAllNotes(): FacilityNote[] {
  return load().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function saveNote(note: FacilityNote): void {
  const existing = load().filter(n => n.placeId !== note.placeId);
  save([...existing, note]);
}

export function deleteNote(placeId: string): void {
  save(load().filter(n => n.placeId !== placeId));
}
