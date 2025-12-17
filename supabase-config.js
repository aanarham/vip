/**
 * Supabase Configuration
 * PT Valor Product Catalog - Supabase Backend
 */

const SUPABASE_CONFIG = {
    url: 'https://tpkafgnufwbqcdhiviwo.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwa2FmZ251ZndicWNkaGl2aXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNDI2MjMsImV4cCI6MjA3OTgxODYyM30.eWdrgGskoly4xwj2gTtVmr_Uot2llRcNCTNViQunAgo',
    tables: {
        products: 'products',
        categories: 'categories'
    },
    bucket: 'product-images'
};

// Initialize Supabase Client
window.supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Helper function to get image URL from Supabase Storage
function getImageUrl(filePath) {
    if (!filePath) return null;
    const { data } = supabase.storage
        .from(SUPABASE_CONFIG.bucket)
        .getPublicUrl(filePath);
    return data.publicUrl;
}

// Helper function to get image preview URL (with transformation)
function getImagePreview(filePath, width = 400, height = 400) {
    if (!filePath) return null;
    // Fallback to standard URL since Image Transformations might not be enabled on free plan
    const { data } = supabase.storage
        .from(SUPABASE_CONFIG.bucket)
        .getPublicUrl(filePath);
    return data.publicUrl;
}
