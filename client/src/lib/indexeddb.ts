import type { ParsedResume } from "./types";

const DB_NAME = "portfolioBuilder";
const STORE_NAME = "resumeData";
const DATA_KEY = "current";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getResumeData(): Promise<ParsedResume | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(DATA_KEY);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function setResumeData(data: ParsedResume): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(data, DATA_KEY);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function hasResumeData(): Promise<boolean> {
  const data = await getResumeData();
  return data !== null;
}
