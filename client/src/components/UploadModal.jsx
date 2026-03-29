import { useState, useContext } from 'react';
import { X, Upload, Lock } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { encryptText, generateBlindIndex } from '../utils/crypto';
import api from '../api/axios';

const UploadModal = ({ onClose, onUploadSuccess }) => {

  const { masterKey } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file || !masterKey) return;

    setUploading(true);
    try {
      const fileKey = Math.random().toString(36).substring(2);
      const encryptionIv = Math.random().toString(36).substring(2); 

      const encryptedName = encryptText(file.name, masterKey);
      const encryptedFileKey = encryptText(fileKey, masterKey);

      const simpleName = file.name.split('.')[0]; 
      const blindIndex = generateBlindIndex(simpleName, masterKey);


      const formData = new FormData();
      formData.append('encryptedFile', file);
      formData.append('fileNameEncrypted', encryptedName);
      formData.append('mimeType', file.type);
      formData.append('encryptionIv', encryptionIv);
      formData.append('fileKeyEncrypted', encryptedFileKey);
      
      
      formData.append('blindIndexHash', blindIndex); 

      await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onUploadSuccess(); 
      onClose(); 

    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Lock className="text-blue-400" size={20} /> Secure Upload
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:bg-slate-700/30 transition-colors cursor-pointer relative">
          <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <Upload className="mx-auto text-blue-400 mb-4" size={40} />
          <p className="text-slate-300 font-medium">
            {file ? file.name : "Click to select a file"}
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Files are encrypted before leaving your browser.
          </p>
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`w-full mt-6 py-3 rounded-lg font-bold text-white transition-all ${
            uploading ? 'bg-slate-600 cursor-wait' : 'bg-blue-600 hover:bg-blue-500'
          }`}
        >
          {uploading ? 'Encrypting & Uploading...' : 'Vault It 🔒'}
        </button>
      </div>
    </div>
  );
};

export default UploadModal;