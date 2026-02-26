import CryptoJS from 'crypto-js';

/**
 * 1. DERIVE MASTER KEY
 * We don't use the raw password to encrypt files (that's weak). 
 * We mix the password with the user's unique 'salt' from the database 
 * and hash it 10,000 times (PBKDF2) to create a military-grade 256-bit key.
 */
export const deriveMasterKey = (password, salt) => {
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32, // 256-bit key
    iterations: 10000  // Makes brute-forcing incredibly slow for hackers
  });
  return key.toString(); // Returns a secure hex string
};

/**
 * 2. ENCRYPT TEXT
 * Takes plain text (like "Secret_Report.pdf") and the Master Key,
 * and turns it into gibberish using AES encryption.
 */
export const encryptText = (text, masterKey) => {
  return CryptoJS.AES.encrypt(text, masterKey).toString();
};

/**
 * 3. DECRYPT TEXT
 * Takes the gibberish from the database and the Master Key,
 * and turns it back into readable text.
 */
export const decryptText = (ciphertext, masterKey) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, masterKey);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    
    // If decryption fails (wrong key), it returns an empty string
    return originalText || "Decryption Failed"; 
  } catch (error) {
    console.log(error);
    return "Decryption Failed";
  }
};

/**
 * 4. GENERATE BLIND INDEX
 * Creates a deterministic hash for searching.
 * Unlike encryption (which changes every time due to IV), 
 * this MUST be the same every time for the same input.
 */
export const generateBlindIndex = (text, masterKey) => {
  // We use HMAC-SHA256 using the Master Key as the secret
  return CryptoJS.HmacSHA256(text.toLowerCase(), masterKey).toString();
};