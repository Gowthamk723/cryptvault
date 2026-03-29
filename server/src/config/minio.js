const Minio = require('minio');
require('dotenv').config({ path: '../.env' });

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT, 10),
    useSSL: false, 
    accessKey: process.env.MINIO_USER,
    secretKey: process.env.MINIO_PASS
});

const initializeMinio = async () => {
    const bucketName = process.env.MINIO_BUCKET;

    try {
        const exists = await minioClient.bucketExists(bucketName);
        if (exists) {
            console.log(`✅ MinIO Bucket '${bucketName}' is ready`);
        } else {

            await minioClient.makeBucket(bucketName, 'us-east-1');
            console.log(`✅ Created MinIO Bucket: '${bucketName}'`);
        }
    } catch (err) {
        console.error('❌ MinIO Connection Error:', err.message);
    }
};

module.exports = {
    minioClient,
    initializeMinio
};