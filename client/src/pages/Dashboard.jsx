import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import UploadModal from '../components/UploadModal';
import { decryptText } from '../utils/crypto'; // <--- REMOVED generateBlindIndex
import { LogOut, FileText, Upload, Download, RefreshCw, Search, Trash2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout, masterKey } = useContext(AuthContext);
  const navigate = useNavigate();

  // 1. Security Check
  useEffect(() => {
    if (!user || !masterKey) {
      navigate('/login');
    }
  }, [user, masterKey, navigate]);

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState(''); // State for Toast

  // 2. Fetch files
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/files/list');
      setFiles(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load your vault.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Helper: Format file size
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper: Show Toast
  const showToast = (message) => {
    setSuccessMsg(message);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Upload Success Handler
  const handleUploadSuccess = () => {
    fetchFiles();
    showToast('File uploaded successfully! 🚀');
  };

  // Storage Calculation
  const totalUsage = files.reduce((acc, file) => acc + parseInt(file.file_size), 0);
  const MAX_LIMIT = 500 * 1024 * 1024; // 500 MB Limit
  const usagePercent = Math.min((totalUsage / MAX_LIMIT) * 100, 100);

  // 3. Download Logic
  const handleDownload = async (fileId) => {
    try {
      const res = await api.get(`/files/${fileId}`, {
        responseType: 'blob',
      });

      const encryptedName = res.headers['x-file-name'];
      
      const realName = masterKey 
        ? decryptText(encryptedName, masterKey) 
        : 'downloaded_file';

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', realName);
      document.body.appendChild(link);
      
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to download file.");
    }
  };

  // 4. Delete Logic (Updated with Toast)
  const handleDelete = async (fileId) => {
    if (!confirm("Are you sure you want to delete this file? This cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/files/${fileId}`);
      // Optimistic update
      setFiles(files.filter(f => f.id !== fileId));
      // Show Success Message
      showToast('File deleted successfully! 🗑️');
    } catch (err) {
      console.error(err);
      alert("Failed to delete file");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {/* HEADER */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            CryptVault
          </h1>
          <p className="text-slate-400 text-sm">Logged in as {user?.email}</p>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg border border-slate-700 transition-colors"
        >
          <LogOut size={18} /> Logout
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto">
        
        {/* STORAGE QUOTA WIDGET */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg md:col-span-1">
            <h3 className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wider">Storage Usage</h3>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-2xl font-bold text-white">{formatSize(totalUsage)}</span>
              <span className="text-slate-500 text-sm mb-1">/ 500 MB</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  usagePercent > 90 ? 'bg-red-500' : 'bg-blue-500'
                }`} 
                style={{ width: `${usagePercent}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-right">{usagePercent.toFixed(1)}% Used</p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg md:col-span-1">
            <h3 className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wider">Total Files</h3>
            <p className="text-3xl font-bold text-white">{files.length}</p>
          </div>
        </div>

        {/* ACTIONS BAR */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="text-blue-400" /> Your Secure Files
          </h2>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* SEARCH BAR */}
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Search decrypted files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500"
              />
              <Search className="absolute left-3 top-2.5 text-slate-500 h-5 w-5" />
            </div>

            {/* REFRESH BUTTON */}
            <button 
              onClick={fetchFiles}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300 transition-colors"
              title="Refresh List"
            >
              <RefreshCw size={20} />
            </button>
            
            {/* UPLOAD BUTTON */}
            <button 
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-lg font-medium text-sm transition-transform transform hover:scale-105 whitespace-nowrap"
            >
              <Upload size={18} /> Upload New
            </button>
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* LOADING STATE */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 animate-pulse">
            Loading your encrypted vault...
          </div>
        ) : (
          /* FILES TABLE */
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
            {files.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <p>Your vault is empty.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/50 border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="p-4 font-medium">Encrypted Name (Zero-Knowledge)</th>
                      <th className="p-4 font-medium">Size</th>
                      <th className="p-4 font-medium">Type</th>
                      <th className="p-4 font-medium">Uploaded</th>
                      <th className="p-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {files
                      .filter((file) => {
                        if (!searchTerm) return true;
                        const realName = decryptText(file.file_name_encrypted, masterKey).toLowerCase();
                        return realName.includes(searchTerm.toLowerCase());
                      })
                      .map((file) => (
                        <tr key={file.id} className="hover:bg-slate-700/30 transition-colors group">
                          <td className="p-4 font-medium text-white truncate max-w-[200px]">
                            {masterKey 
                              ? decryptText(file.file_name_encrypted, masterKey) 
                              : file.file_name_encrypted
                            }
                          </td>
                          <td className="p-4 text-slate-300 text-sm whitespace-nowrap">{formatSize(file.file_size)}</td>
                          <td className="p-4 text-slate-400 text-sm">{file.mime_type}</td>
                          <td className="p-4 text-slate-400 text-sm whitespace-nowrap">
                            {new Date(file.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right flex justify-end gap-2">
                            <button 
                              onClick={() => handleDownload(file.id)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 p-2 rounded-full transition-colors"
                              title="Download Decrypted"
                            >
                              <Download size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(file.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2 rounded-full transition-colors"
                              title="Delete Permanently"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* RENDER MODAL IF OPEN */}
      {showUpload && (
        <UploadModal 
          onClose={() => setShowUpload(false)} 
          onUploadSuccess={handleUploadSuccess} 
        />
      )}

      {/* SUCCESS TOAST NOTIFICATION */}
      {successMsg && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-2 animate-bounce z-50">
          <div className="bg-white/20 p-1 rounded-full">
            <Check size={14} />
          </div>
          {successMsg}
        </div>
      )}
    </div>
  );
};

export default Dashboard;