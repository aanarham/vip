/**
 * Appwrite Configuration
 * Initialize Appwrite client and services
 */

const APPWRITE_CONFIG = {
    endpoint: 'https://sgp.cloud.appwrite.io/v1',
    projectId: '6921aeb100206d538024',
    databaseId: '6921afe30008718f1f27',
    collections: {
        products: 'products',
        categories: 'categories'
    },
    bucketId: 'product-images',
    apiKey: 'standard_d2c4e3c50352c80aabd58a795142b3d3a40c06bd03651479c05f400a69b65661f66058610adc53528dd0db57206dd0455ef56f8abcd1b60aafcb646832c7e32a6fd1dbf8babc0422faa1cf1866eaef79c87888f5c4a8a39099e2a0ce2f07f5ce19904747dc632c8cf822bfa6f4a04daf1eb21a7f81dbeedb8d18e402c0a9cc12'
};

// Initialize Appwrite Client
const appwriteClient = new Appwrite.Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

// Initialize Services
const databases = new Appwrite.Databases(appwriteClient);
const storage = new Appwrite.Storage(appwriteClient);
const account = new Appwrite.Account(appwriteClient);

// Helper function to get image URL from Appwrite Storage
function getImageUrl(fileId) {
    if (!fileId) return null;
    return `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${fileId}/view?project=${APPWRITE_CONFIG.projectId}`;
}

// Helper function to get image preview URL (with dimensions)
function getImagePreview(fileId, width = 400, height = 400) {
    if (!fileId) return null;
    return `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${fileId}/preview?project=${APPWRITE_CONFIG.projectId}&width=${width}&height=${height}`;
}

// Admin credentials (stored in database for simple auth)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123' // This will be hashed when stored
};
