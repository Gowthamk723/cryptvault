# 🔒 CryptVault: Privacy-First Cloud Storage

![Tech Stack](https://skillicons.dev/icons?i=react,nodejs,express,postgres,docker,tailwind,minio)

**CryptVault** is a secure file storage system with a **Zero-Knowledge Metadata Architecture**. 

While traditional cloud storage providers can read your filenames and search your data, CryptVault ensures that the server **never** sees your filenames in plain text. It uses **Client-Side Blind Indexing** to allow you to search your files without the server ever knowing what you are searching for.

> **Note:** This is an educational portfolio project demonstrating advanced cryptography concepts like Client-Side AES, PBKDF2 Key Derivation, and Blind Indexing.

---

## 🚀 Key Features

* **🛡️ Client-Side Metadata Encryption:** Filenames are encrypted in the browser using **AES-256** before upload. The database stores only ciphertext.
* **👁️ Blind Search Indexing:** Implements a privacy-preserving search engine. You can search for "Report" and find your file, but the server only sees a hashed index (`hmac-sha256`), preserving total privacy.
* **🔑 Dual-Layer Security:** * **Authentication:** Handled via **Argon2** hashing (Server-Side).
    * **Encryption:** Handled via **PBKDF2** key derivation (Client-Side). The server never sees the Encryption Master Key.
* **☁️ Object Storage:** Scalable file storage using **MinIO** (S3-Compatible).
* **⚡ Modern UI:** Responsive Dashboard built with **React**, **Vite**, and **Tailwind CSS**.
* **📊 Storage Quotas:** Real-time visualization of storage usage.

---

## 🛠️ Tech Stack

* **Frontend:** React, Tailwind CSS, Lucide Icons, Crypto-JS (AES-CBC/PBKDF2/HMAC)
* **Backend:** Node.js, Express, Multer
* **Database:** PostgreSQL (Encrypted Metadata), MinIO (File Storage)
* **DevOps:** Docker, Docker Compose

---

## 🏗️ Architecture & Security Model



### 1. Separation of Concerns
We treat **Identity** and **Access** as two separate cryptographic flows:
* **Login (Identity):** The server hashes your password with **Argon2id** to verify you are who you say you are.
* **Decryption (Access):** The browser locally derives a separate `MasterKey` using **PBKDF2** (Password + Salt). This key lives in **Volatile Memory (RAM)** and is never sent to the server.

### 2. The Write Path (Upload)
1.  User selects a file (e.g., `Secret_Plans.pdf`).
2.  **Browser:** Encrypts the filename -> `U2FsdGVkX1...`.
3.  **Browser:** Generates a Blind Index Hash -> `hmac(Secret_Plans)`.
4.  **Browser:** Sends the *Encrypted Name*, *Blind Index*, and *File Blob* to the server.
5.  **Server:** Stores the blob in MinIO and the encrypted metadata in PostgreSQL.

### 3. The Read Path (Search & Download)
1.  **Search:** User types "Secret". Browser calculates `hmac("Secret")` and requests matches.
2.  **Server:** Returns records matching that hash (without knowing what the hash means).
3.  **Decrypt:** Browser receives `U2FsdGVkX1...` and uses the `MasterKey` to display `Secret_Plans.pdf`.

---

## 📦 Installation & Setup

### Prerequisites
* Node.js (v18+)
* Docker Desktop (Running)

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/cryptvault.git](https://github.com/YOUR_USERNAME/cryptvault.git)
cd cryptvault
2. Configure Environment Variables
Create a .env file in the server/ folder:

Bash
# server/.env

PORT=5000
JWT_SECRET=super_secret_jwt_key_change_me

# Database (Matches docker-compose.yml)
DB_USER=admin
DB_HOST=localhost
DB_NAME=cryptvault
DB_PASSWORD=admin123
DB_PORT=5432

# MinIO (Object Storage)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=vault-bucket
3. Start Infrastructure (DB + Storage)
Bash
docker-compose up -d
4. Start the Backend
Bash
cd server
npm install
npm run dev
5. Start the Frontend
Open a new terminal:

Bash
cd client
npm install
npm run dev
6. Access the Vault
Visit http://localhost:5173

🔮 Roadmap (Future Improvements)
[ ] Full Blob Encryption: Currently, file content is stored as plain objects. The next phase will implement Client-Side AES-GCM for the binary blobs to achieve full Zero-Knowledge status.

[ ] Key Rotation: Mechanism to re-encrypt data when users change passwords.

[ ] Secure Sharing: RSA Public Key cryptography for sharing files between users.