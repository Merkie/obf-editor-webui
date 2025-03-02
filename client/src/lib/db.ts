// db.ts
export interface ManifestRecord {
  id: string; // "manifest" (key)
  root: string; // e.g. "board_1_235.obf"
}

export interface BoardRecord {
  id: string; // e.g. "1_235"
  name: string; // e.g. "CommuniKate Months"
  data: string; // stringified JSON of the entire board file
}

// NEW: minimal record that only has id & name
export interface BoardMetadataRecord {
  id: string;
  name: string;
}

export interface ImageRecord {
  path: string;
  file: Blob;
}

const DB_NAME = "MyOpenBoardDB";
const DB_VERSION = 2; // <--- increment the version, so onupgradeneeded is triggered

let _db: IDBDatabase | null = null;

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (_db) return resolve(_db);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;

      // Create object stores if they do not already exist
      if (!db.objectStoreNames.contains("manifest")) {
        db.createObjectStore("manifest", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("boards")) {
        db.createObjectStore("boards", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("images")) {
        db.createObjectStore("images", { keyPath: "path" });
      }

      // NEW: create boardMetadata store for minimal board records
      if (!db.objectStoreNames.contains("boardMetadata")) {
        db.createObjectStore("boardMetadata", { keyPath: "id" });
      }
    };

    request.onsuccess = () => {
      _db = request.result;
      resolve(_db);
    };

    request.onerror = () => reject(request.error);
  });
}
