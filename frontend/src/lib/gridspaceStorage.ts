const DB_NAME = "io-education-local-db";
const DB_VERSION = 1;
const GRIDSPACE_STORE = "gridspaceSnapshots";

export type GridspaceSnapshot = {
    storageKey: string;
    paths: unknown;
    updatedAtIso: string;
};

function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;

            if (!db.objectStoreNames.contains(GRIDSPACE_STORE)) {
                db.createObjectStore(GRIDSPACE_STORE, {
                    keyPath: "storageKey",
                });
            }
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

export async function saveGridspaceSnapshot(
    storageKey: string,
    paths: unknown
): Promise<void> {
    const db = await openDatabase();

    await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(GRIDSPACE_STORE, "readwrite");
        const store = transaction.objectStore(GRIDSPACE_STORE);

        const snapshot: GridspaceSnapshot = {
            storageKey,
            paths,
            updatedAtIso: new Date().toISOString(),
        };

        const request = store.put(snapshot);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject(request.error);
        };

        transaction.oncomplete = () => {
            db.close();
        };

        transaction.onerror = () => {
            db.close();
            reject(transaction.error);
        };
    });
}

export async function loadGridspaceSnapshot(
    storageKey: string
): Promise<GridspaceSnapshot | null> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(GRIDSPACE_STORE, "readonly");
        const store = transaction.objectStore(GRIDSPACE_STORE);

        const request = store.get(storageKey);

        request.onsuccess = () => {
            const result = request.result;

            if (!result) {
                resolve(null);
                return;
            }

            resolve(result as GridspaceSnapshot);
        };

        request.onerror = () => {
            reject(request.error);
        };

        transaction.oncomplete = () => {
            db.close();
        };

        transaction.onerror = () => {
            db.close();
            reject(transaction.error);
        };
    });
}

export async function listGridspaceSnapshots(): Promise<GridspaceSnapshot[]> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(GRIDSPACE_STORE, "readonly");
        const store = transaction.objectStore(GRIDSPACE_STORE);

        const request = store.getAll();

        request.onsuccess = () => {
            resolve((request.result ?? []) as GridspaceSnapshot[]);
        };

        request.onerror = () => {
            reject(request.error);
        };

        transaction.oncomplete = () => {
            db.close();
        };

        transaction.onerror = () => {
            db.close();
            reject(transaction.error);
        };
    });
}

export async function deleteGridspaceSnapshot(storageKey: string): Promise<void> {
    const db = await openDatabase();

    await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(GRIDSPACE_STORE, "readwrite");
        const store = transaction.objectStore(GRIDSPACE_STORE);

        const request = store.delete(storageKey);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject(request.error);
        };

        transaction.oncomplete = () => {
            db.close();
        };

        transaction.onerror = () => {
            db.close();
            reject(transaction.error);
        };
    });
}