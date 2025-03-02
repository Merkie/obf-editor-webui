// db-ops.ts
import {
  openDB,
  ManifestRecord,
  BoardRecord,
  BoardMetadataRecord, // NEW
  ImageRecord,
} from "./db";

export async function storeManifest(root: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction("manifest", "readwrite");
  const store = tx.objectStore("manifest");

  const record: ManifestRecord = {
    id: "manifest",
    root,
  };
  store.put(record);

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getManifest(): Promise<ManifestRecord | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("manifest", "readonly");
    const store = tx.objectStore("manifest");
    const req = store.get("manifest");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Store an array of boards (full record) AND also store boardMetadata */
export async function storeBoards(boards: BoardRecord[]): Promise<void> {
  if (!boards.length) return;

  const db = await openDB();
  // Open a single transaction that covers both 'boards' and 'boardMetadata'
  const tx = db.transaction(["boards", "boardMetadata"], "readwrite");
  const boardsStore = tx.objectStore("boards");
  const metadataStore = tx.objectStore("boardMetadata");

  boards.forEach((b) => {
    // 1) store the full BoardRecord
    boardsStore.put(b);

    // 2) store just { id, name } in boardMetadata
    const meta: BoardMetadataRecord = {
      id: b.id,
      name: b.name,
    };
    metadataStore.put(meta);
  });

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Fetch all boards’ metadata (id, name) from 'boardMetadata'.
 * If you truly want the entire BoardRecord, you could have a separate function
 * that queries the 'boards' store by ID. But for a list, we only need metadata.
 */
export async function getAllBoards(): Promise<BoardMetadataRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("boardMetadata", "readonly");
    const store = tx.objectStore("boardMetadata");
    const request = store.getAll(); // returns all BoardMetadataRecords
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getBoard(id: string): Promise<BoardRecord | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("boards", "readonly");
    const store = tx.objectStore("boards");
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function storeImages(images: ImageRecord[]): Promise<void> {
  if (!images.length) return;
  const db = await openDB();
  const tx = db.transaction("images", "readwrite");
  const store = tx.objectStore("images");

  images.forEach((img) => store.put(img));

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getImageBlob(path: string): Promise<Blob | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("images", "readonly");
    const store = tx.objectStore("images");
    const req = store.get(path);
    req.onsuccess = () => {
      if (!req.result) resolve(undefined);
      else resolve(req.result.file);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function clearDB(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(
    ["manifest", "boards", "images", "boardMetadata"], // <--- clear new store as well
    "readwrite"
  );
  tx.objectStore("manifest").clear();
  tx.objectStore("boards").clear();
  tx.objectStore("images").clear();
  tx.objectStore("boardMetadata").clear();
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
