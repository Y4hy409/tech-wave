const DB_NAME = "complaints-offline-db";
const STORE_NAME = "pendingComplaints";

type ComplaintDraft = {
  apartment_id: string;
  resident_id: string;
  title: string;
  description: string;
  is_synced: boolean;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function queueOfflineComplaint(complaint: ComplaintDraft): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).add(complaint);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function syncPendingComplaints(apiBase = ""): Promise<void> {
  const db = await openDb();
  const records: any[] = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });

  for (const item of records) {
    const { id, ...payload } = item;
    const response = await fetch(`${apiBase}/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, is_synced: true }),
    });
    if (response.ok) {
      await new Promise<void>((resolve, reject) => {
        const deleteTx = db.transaction(STORE_NAME, "readwrite");
        deleteTx.objectStore(STORE_NAME).delete(id);
        deleteTx.oncomplete = () => resolve();
        deleteTx.onerror = () => reject(deleteTx.error);
      });
    }
  }
}
