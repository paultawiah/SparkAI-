
/**
 * SparkAI End-to-End Encryption (E2EE) Service
 * Uses Web Crypto API for hardware-backed security and IndexedDB for persistence.
 */

export interface EncryptedPayload {
  data: string; // Base64 encoded encrypted message
  iv: string;   // Initialization vector
  key?: string; // Encrypted AES key (wrapped with RSA)
}

export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

const DB_NAME = 'SparkSecureStore';
const STORE_NAME = 'IdentityKeys';

const getDB = (): Promise<IDBDatabase> => {
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
};

// Persist keys to IndexedDB
const saveKeysToDisk = async (keys: KeyPair) => {
  // CRITICAL: Export keys BEFORE opening the IndexedDB transaction.
  // Awaiting non-IDB promises inside a transaction causes it to auto-commit.
  const pubJwk = await window.crypto.subtle.exportKey("jwk", keys.publicKey);
  const privJwk = await window.crypto.subtle.exportKey("jwk", keys.privateKey);

  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  
  store.put(pubJwk, 'pub');
  store.put(privJwk, 'priv');
  
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

// Retrieve keys from IndexedDB
const loadKeysFromDisk = async (): Promise<KeyPair | null> => {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  
  // Wrap IDB requests in promises to avoid transaction timeout issues
  const getRequest = (key: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  };

  try {
    const pubJwk = await getRequest('pub');
    const privJwk = await getRequest('priv');

    if (!pubJwk || !privJwk) {
      return null;
    }

    const [publicKey, privateKey] = await Promise.all([
      window.crypto.subtle.importKey(
        "jwk", pubJwk, 
        { name: "RSA-OAEP", hash: "SHA-256" }, 
        true, ["encrypt", "wrapKey"]
      ),
      window.crypto.subtle.importKey(
        "jwk", privJwk, 
        { name: "RSA-OAEP", hash: "SHA-256" }, 
        true, ["decrypt", "unwrapKey"]
      )
    ]);

    return { publicKey, privateKey };
  } catch (err) {
    console.error("Failed to load keys from disk:", err);
    return null;
  }
};

// Generate a new RSA-OAEP key pair for a user
export const generateUserIdentityKeys = async (): Promise<KeyPair> => {
  // Try to load existing keys first
  const existing = await loadKeysFromDisk();
  if (existing) return existing;

  const keys = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true, // extractable
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
  );
  
  await saveKeysToDisk(keys);
  return keys;
};

// Export a public key to a format that can be stored/sent (JWK)
export const exportPublicKey = async (key: CryptoKey): Promise<string> => {
  const exported = await window.crypto.subtle.exportKey("jwk", key);
  return JSON.stringify(exported);
};

// Import a public key from JWK format
export const importPublicKey = async (jwkString: string): Promise<CryptoKey> => {
  const jwk = JSON.parse(jwkString);
  return await window.crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt", "wrapKey"]
  );
};

// Encrypt data for a specific recipient using their public key
export const encryptForRecipient = async (
  text: string,
  recipientPublicKey: CryptoKey
): Promise<EncryptedPayload> => {
  const sessionKey = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedText = new TextEncoder().encode(text);
  const encryptedContent = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    sessionKey,
    encodedText
  );

  const wrappedKey = await window.crypto.subtle.wrapKey(
    "raw",
    sessionKey,
    recipientPublicKey,
    "RSA-OAEP"
  );

  return {
    data: btoa(String.fromCharCode(...new Uint8Array(encryptedContent))),
    iv: btoa(String.fromCharCode(...iv)),
    key: btoa(String.fromCharCode(...new Uint8Array(wrappedKey))),
  };
};

// Decrypt a payload using the user's private key
export const decryptPayload = async (
  payload: EncryptedPayload,
  userPrivateKey: CryptoKey
): Promise<string> => {
  if (!payload.key) throw new Error("Missing session key in payload");

  const wrappedKeyBuffer = Uint8Array.from(atob(payload.key), (c) => c.charCodeAt(0));
  const sessionKey = await window.crypto.subtle.unwrapKey(
    "raw",
    wrappedKeyBuffer,
    userPrivateKey,
    "RSA-OAEP",
    "AES-GCM",
    true,
    ["decrypt"]
  );

  const iv = Uint8Array.from(atob(payload.iv), (c) => c.charCodeAt(0));
  const encryptedData = Uint8Array.from(atob(payload.data), (c) => c.charCodeAt(0));
  
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    sessionKey,
    encryptedData
  );

  return new TextDecoder().decode(decryptedBuffer);
};
