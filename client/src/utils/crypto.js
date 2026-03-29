import CryptoJS from 'crypto-js';

export const deriveMasterKey = (password, salt) => {
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32, 
    iterations: 10000  
  });
  return key.toString(); 
};

export const encryptText = (text, masterKey) => {
  return CryptoJS.AES.encrypt(text, masterKey).toString();
};

export const decryptText = (ciphertext, masterKey) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, masterKey);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    
    return originalText || "Decryption Failed"; 
  } catch (error) {
    console.log(error);
    return "Decryption Failed";
  }
};


export const generateBlindIndex = (text, masterKey) => {
  
  return CryptoJS.HmacSHA256(text.toLowerCase(), masterKey).toString();
};