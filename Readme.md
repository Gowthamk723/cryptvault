# 🔒 CryptVault: Privacy-First Cloud Storage

![Tech Stack](https://skillicons.dev/icons?i=react,nodejs,express,postgres,docker,tailwind,minio)

---

## 📌 Overview

**CryptVault** is a secure file storage system built with a **Zero-Knowledge Metadata Architecture**.

Unlike traditional cloud storage providers that can read filenames and metadata, CryptVault ensures the server **never sees your filenames in plain text**. It uses **Client-Side Blind Indexing** to enable search without exposing user data.

---

## 🚀 Key Features

### 🛡️ Client-Side Metadata Encryption
- Filenames are encrypted in the browser using **AES-256**
- Only ciphertext is stored in the database

### 🔑 Dual-Layer Security
- **Authentication:** Argon2id (server-side password hashing)
- **Encryption:** PBKDF2 (client-side key derivation)
- Encryption key never leaves the browser

### ☁️ Object Storage
- Scalable storage powered by **MinIO (S3-compatible)**

### ⚡ Modern UI
- Built with **React, Vite, Tailwind CSS**
- Clean and responsive dashboard

### 🐳 Dockerized Infrastructure
- Fully containerized system:
  - Frontend
  - Backend API
  - PostgreSQL
  - MinIO

---

## 🏗️ Architecture & Security Model

### 1️⃣ Separation of Concerns

We separate **Identity** and **Access** into two cryptographic flows:

- **Login (Identity):**
  - Password hashed using **Argon2id**
  - Used only for authentication

- **Decryption (Access):**
  - Browser derives `MasterKey` using **PBKDF2 (Password + Salt)**
  - Key stays in **RAM (volatile memory)**
  - Never sent to the server

---

### 2️⃣ Write Path (Upload Flow)

1. User selects a file (e.g., `Secret_Plans.pdf`)
2. Browser encrypts filename → `U2FsdGVkX1...`
3. Browser generates blind index → `hmac(Secret_Plans)`
4. Browser sends:
   - Encrypted filename
   - Blind index
   - File blob
5. Server:
   - Stores file in **MinIO**
   - Stores encrypted metadata in **PostgreSQL**

---

### 3️⃣ Read Path (Search & Download)

1. User searches `"Secret"`
2. Browser computes `hmac("Secret")`
3. Server returns matching records (without knowing meaning)
4. Browser decrypts filename using `MasterKey`
5. Displays: `Secret_Plans.pdf`

---

## 📦 Installation & Setup (Docker)

### ✅ Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)
- Git

---

### 1️⃣ Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/cryptvault.git
cd cryptvault
```

---

### 2️⃣ Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=db
DB_PORT=5432
DB_NAME=cryptvault
DB_USER=admin
DB_PASS=admin123

# MinIO
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_BUCKET=user-files
MINIO_USER=minioadmin
MINIO_PASS=minioadmin

# Security
JWT_SECRET=your_super_secret_jwt_string_here
```

---

### 3️⃣ Run the Application

```bash
docker-compose up --build
```

> ℹ️ The database initializes automatically using `init.sql`.

---

### 4️⃣ Access Services

- 🌐 Frontend: http://localhost:5173  
- 🔧 Backend API: http://localhost:5000  
- 📦 MinIO Console: http://localhost:9001  
  - Username: `minioadmin`  
  - Password: `minioadmin`  

---

## 🔮 Roadmap

- [ ] 🔐 Full Blob Encryption (AES-GCM for files)
- [ ] 🔄 Key Rotation (Re-encrypt on password change)
- [ ] 🤝 Secure Sharing (RSA Public Key cryptography)

---

## 🧠 Summary

CryptVault demonstrates how modern cryptographic principles can be applied to build a **privacy-first cloud storage system**, ensuring:

- Zero-knowledge metadata
- Secure client-side encryption
- Scalable and production-ready architecture

---

## ⭐ Contribute / Showcase

If you found this project useful or inspiring:

- ⭐ Star the repository
- 🍴 Fork and enhance it
- 💼 Add it to your portfolio

---