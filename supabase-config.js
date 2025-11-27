/**
 * Supabase Configuration
 * PT Valor Product Catalog - Supabase Backend
 */

const SUPABASE_CONFIG = {
    url: 'https://ajnnghehyotlyaeqntcg.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqbm5naGVoeW90bHlhZXFudGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjUwNTIsImV4cCI6MjA3OTc0MTA1Mn0.AscSVnB_nGHTimke4xxySzZ73r6pCSOQ3VTIvBaQvg8',
    tables: {
        products: 'products',
        categories: 'categories'
    },
    bucket: 'product-images'
};

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

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
    const { data } = supabase.storage
        .from(SUPABASE_CONFIG.bucket)
        .getPublicUrl(filePath, {
            transform: {
                width: width,
                height: height,
                resize: 'cover'
            }
        });
    return data.publicUrl;
}
