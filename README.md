# PT VALOR INSPIRATION PESONA - Product Catalog

A modern product catalog application powered by Appwrite backend.

## 🚀 Features

- **Product Management**: Full CRUD operations for products
- **Category Management**: Organize products by categories
- **Image Storage**: Product images stored in Appwrite Storage
- **Search & Filter**: Real-time product search and category filtering
- **Admin Panel**: Secure admin interface for managing catalog
- **Responsive Design**: Works on all devices with modern glassmorphism UI

## 🛠️ Technology Stack

- **Frontend**: HTML, Vanilla CSS, JavaScript
- **Backend**: Appwrite Cloud
- **Database**: Appwrite Database
- **Storage**: Appwrite Storage
- **Authentication**: Custom authentication with localStorage

## 📋 Prerequisites

Before running this application, ensure you have:

1. An Appwrite account and project
2. Appwrite Database with collections:
   - `products` collection with attributes:
     - `nama_product` (string)
     - `harga` (float)
     - `gambar` (string) - stores file ID
     - `kategori` (string)
   - `categories` collection with attributes:
     - `name` (string)
     - `display_order` (integer)
3. Appwrite Storage bucket named `product-images`

## 🔧 Configuration

The application is already configured with your Appwrite credentials in `appwrite-config.js`:

- **Endpoint**: https://sgp.cloud.appwrite.io/v1
- **Project ID**: 6921aeb100206d538024
- **Database ID**: 6921afe30008718f1f27
- **Collections**: products, categories
- **Bucket ID**: product-images

## 🚦 Getting Started

### Option 1: Local Development

1. Open `index.html` in a modern web browser
2. Or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server
   ```
3. Navigate to `http://localhost:8000`

### Option 2: Deploy to Static Hosting

Deploy the entire project folder to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting
- Cloudflare Pages

## 👤 Admin Access

**Default Credentials:**
- Username: `admin`
- Password: `admin123`

**Important**: Change these credentials in `appwrite-config.js` for production use.

## 📁 File Structure

```
project2/
├── index.html              # Main product catalog page
├── admin.html              # Admin panel with login
├── about.html              # About page
├── styles.css              # All styling (unchanged)
├── script.js               # Main catalog functionality
├── admin.js                # Admin panel functionality
├── appwrite-config.js      # Appwrite configuration
└── README.md               # This file
```

## 🔐 Security Notes

1. **API Key**: The API key is exposed in client-side code. For production:
   - Use Appwrite's permission system
   - Set up proper collection-level permissions
   - Consider using Appwrite Functions for sensitive operations

2. **Authentication**: Currently uses simple localStorage-based auth
   - For production, consider implementing Appwrite Account authentication
   - Add session management
   - Implement proper password hashing

## 📝 Usage Guide

### For Users (Catalog View)

1. **Browse Products**: View all products on the main page
2. **Filter by Category**: Click on categories in the sidebar
3. **Search**: Use the search box to find specific products
4. **View Details**: Click on any product card to see full details

### For Admins

1. **Login**: Navigate to `admin.html` and login with credentials
2. **Manage Products**:
   - Add new products with images
   - Edit existing products
   - Delete products
3. **Manage Categories**:
   - Switch to "Kelola Kategori" tab
   - Add, edit, or delete categories
   - Set display order for categories

## 🐛 Troubleshooting

### Products not loading?
- Check browser console for errors
- Verify Appwrite project ID and database ID are correct
- Ensure collections exist with proper attributes

### Images not displaying?
- Verify bucket ID is correct
- Check file permissions in Appwrite Storage
- Ensure images were uploaded successfully

### Cannot login to admin?
- Check credentials in `appwrite-config.js`
- Clear browser localStorage and try again
- Check browser console for errors

## 🔄 Migration from PHP/MySQL

This application was migrated from PHP/MySQL to Appwrite. Key changes:

- ✅ Removed all PHP files and MySQL database
- ✅ Converted to static HTML files
- ✅ Integrated Appwrite SDK for all backend operations
- ✅ Migrated image storage to Appwrite Storage
- ✅ Maintained all original functionality and styling

## 📞 Support

**Developer**: AanArham  
**Contact**: 082393654513

## 📄 License

© 2025 PT VALOR INSPIRATION PESONA. All rights reserved.
