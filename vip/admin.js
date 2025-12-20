// Global state
let allProducts = [];
let allCategories = [];
let editingProductId = null;
let editingCategoryId = null;
let currentImageFile = null;
let isLoggedIn = false;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    initializeEventListeners();
    // Search event for admin
    const adminSearchInput = document.getElementById('adminSearchInput');
    if (adminSearchInput) {
        adminSearchInput.addEventListener('input', (e) => {
            filterAdminProducts(e.target.value);
        });
    }
// Filter products in admin panel
function filterAdminProducts(query) {
    query = (query || '').toLowerCase();
    let filtered = allProducts;
    if (query) {
        filtered = filtered.filter(p =>
            (p['nama produk'] && p['nama produk'].toLowerCase().includes(query)) ||
            (p.kategori && p.kategori.toLowerCase().includes(query))
        );
    }
    displayProductsList(filtered);
}
});

// Admin credentials
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Check authentication status
function checkAuthStatus() {
    const isAuth = localStorage.getItem('adminAuthenticated') === 'true';
    const adminUser = localStorage.getItem('adminUsername');

    if (isAuth && adminUser) {
        showAdminPanel(adminUser);
    } else {
        showLoginScreen();
    }
}

// Show login screen
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
    isLoggedIn = false;
}

// Show admin panel
function showAdminPanel(username) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    document.querySelector('.admin-container').classList.add('active');
    document.getElementById('adminUsername').textContent = username;
    isLoggedIn = true;

    // Load data
    loadCategories();
    loadProducts();
}

// Initialize event listeners
function initializeEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchTab(tab);
        });
    });

    // Product form
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }

    // Category form
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', handleCategorySubmit);
    }

    // Cancel buttons
    const cancelButton = document.getElementById('cancelButton');
    if (cancelButton) {
        cancelButton.addEventListener('click', resetProductForm);
    }

    const categoryCancelButton = document.getElementById('categoryCancelButton');
    if (categoryCancelButton) {
        categoryCancelButton.addEventListener('click', resetCategoryForm);
    }

    // Image preview
    const productImage = document.getElementById('productImage');
    if (productImage) {
        productImage.addEventListener('change', handleImagePreview);
    }
}

// Handle login
function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginAlert = document.getElementById('loginAlert');

    // Simple authentication check
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Store authentication in localStorage
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminUsername', username);

        // Show admin panel
        showAdminPanel(username);
    } else {
        loginAlert.innerHTML = `
            <div class="alert alert-error">
                ⚠️ Username atau password salah!
            </div>
        `;

        setTimeout(() => {
            loginAlert.innerHTML = '';
        }, 3000);
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminUsername');
    showLoginScreen();
}

// Switch tabs
function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tab}-tab`).classList.add('active');
}

// Load categories from Supabase
async function loadCategories() {
    if (!isLoggedIn) return;

    try {
            const { data, error } = await window.supabaseClient
            .from(SUPABASE_CONFIG.tables.categories)
            .select('*')
            .order('display_order', { ascending: true })
            .limit(100);

        if (error) throw error;

        allCategories = data || [];
        displayCategoriesList(allCategories);
        updateCategorySelect(allCategories);
    } catch (error) {
        console.error('Error loading categories:', error);
        showAlert('Gagal memuat kategori', 'error');
    }
}

// Display categories list
function displayCategoriesList(categories) {
    const container = document.getElementById('categoriesList');
    if (!container) return;

    if (categories.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-text">Belum ada kategori</div></div>';
        return;
    }

    container.innerHTML = categories.map(category => `
        <div class="product-item">
            <div class="product-item-info">
                <div class="product-item-name">${category.name}</div>
                <div class="product-item-meta">Urutan: ${category.display_order || 0}</div>
            </div>
            <div class="product-item-actions">
                <button class="btn btn-warning btn-small" onclick="editCategory('${category.id}')">
                    ✏️ Edit
                </button>
                <button class="btn btn-danger btn-small" onclick="deleteCategory('${category.id}', '${category.name}')">
                    🗑️ Hapus
                </button>
            </div>
        </div>
    `).join('');
}

// Update category select dropdown
function updateCategorySelect(categories) {
    const select = document.getElementById('productCategory');
    if (!select) return;

    select.innerHTML = '<option value="">Pilih Kategori</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

// Load products from Supabase
async function loadProducts() {
    if (!isLoggedIn) return;

    try {
            const { data, error } = await window.supabaseClient
            .from(SUPABASE_CONFIG.tables.products)
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1000);

        if (error) throw error;

        allProducts = data || [];
        displayProductsList(allProducts);
    } catch (error) {
        console.error('Error loading products:', error);
        showAlert('Gagal memuat produk', 'error');
    }
}

// Display products list
function displayProductsList(products) {
    const container = document.getElementById('productsList');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-text">Belum ada produk</div></div>';
        return;
    }

    container.innerHTML = products.map(product => {
        const imageUrl = product.gambar ? getImagePreview(product.gambar, 80, 80) : null;
        const imageContent = imageUrl ?
            `<img src="${imageUrl}" alt="${product['nama produk']}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-sm);">` :
            '🖼️';

        return `
            <div class="product-item">
                <div class="product-item-image">${imageContent}</div>
                <div class="product-item-info">
                    <div class="product-item-name">${product['nama produk']}</div>
                    <div class="product-item-meta">
                        ${product.kategori} • Rp ${formatPrice(product.harga)}
                    </div>
                </div>
                <div class="product-item-actions">
                    <button class="btn btn-warning btn-small" onclick="editProduct('${product.id}')">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteProduct('${product.id}', '${product['nama produk']}')">
                        🗑️ Hapus
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Handle image preview
function handleImagePreview(e) {
    const file = e.target.files[0];
    if (!file) return;
    // Validasi file gambar
    if (!file.type.startsWith('image/')) {
        showAlert('File harus berupa gambar', 'error');
        return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB
        showAlert('Ukuran gambar maksimal 2MB', 'error');
        return;
    }
    currentImageFile = file;
    const preview = document.getElementById('imagePreview');
    const reader = new FileReader();
    reader.onload = (e) => {
        preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// Handle product form submit
async function handleProductSubmit(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '⏳ Menyimpan...';
    submitBtn.disabled = true;

    try {
        const productData = {
            'nama produk': document.getElementById('productName').value,
            harga: parseFloat(document.getElementById('productPrice').value),
            kategori: document.getElementById('productCategory').value
        };

        // Upload image if selected
        if (currentImageFile) {
            const filePath = await uploadImage(currentImageFile);
            productData.gambar = filePath;
        }

        if (editingProductId) {
            // Update existing product
                const { error } = await window.supabaseClient
                .from(SUPABASE_CONFIG.tables.products)
                .update(productData)
                .eq('id', editingProductId);

            if (error) throw error;
            showAlert('Produk berhasil diperbarui', 'success');
        } else {
            // Create new product
                const { error } = await window.supabaseClient
                .from(SUPABASE_CONFIG.tables.products)
                .insert([productData]);

            if (error) throw error;
            showAlert('Produk berhasil ditambahkan', 'success');
        }

        resetProductForm();
        loadProducts();
    } catch (error) {
        console.error('Error saving product:', error);
        showAlert('Gagal menyimpan produk: ' + error.message, 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Upload image to Supabase Storage
async function uploadImage(file) {
    try {
        // Validasi file gambar
        if (!file.type.startsWith('image/')) {
            throw new Error('File harus berupa gambar');
        }
        if (file.size > 2 * 1024 * 1024) { // 2MB
            throw new Error('Ukuran gambar maksimal 2MB');
        }
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `products/${fileName}`;
        const { error } = await supabase.storage
            .from(SUPABASE_CONFIG.bucket)
            .upload(filePath, file);
        if (error) throw error;
        return filePath;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Gagal mengupload gambar: ' + error.message);
    }
}

// Edit product
async function editProduct(productId) {
    const product = allProducts.find(p => p.id == productId);
    if (!product) return;

    editingProductId = product.id;

    document.getElementById('productName').value = product['nama produk'];
    document.getElementById('productPrice').value = product.harga;
    document.getElementById('productCategory').value = product.kategori;

    if (product.gambar) {
        const imageUrl = getImagePreview(product.gambar, 200, 200);
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = `<img src="${imageUrl}" alt="Current image">`;
        preview.style.display = 'block';
    }

    document.getElementById('formTitle').textContent = 'Edit Produk';
    document.getElementById('submitButtonText').textContent = '✓ Update Produk';
    document.getElementById('cancelButton').style.display = 'block';

    document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth' });
}

// Delete product
async function deleteProduct(productId, productName) {
    if (!confirm(`Apakah Anda yakin ingin menghapus produk "${productName}"?`)) {
        return;
    }

    try {
        const product = allProducts.find(p => p.id == productId);

        if (product && product.gambar) {
            try {
                    await window.supabaseClient.storage
                    .from(SUPABASE_CONFIG.bucket)
                    .remove([product.gambar]);
            } catch (error) {
                console.error('Error deleting image:', error);
            }
        }

            const { error } = await window.supabaseClient
            .from(SUPABASE_CONFIG.tables.products)
            .delete()
            .eq('id', productId);

        if (error) throw error;

        showAlert('Produk berhasil dihapus', 'success');
        loadProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
        showAlert('Gagal menghapus produk: ' + error.message, 'error');
    }
}

// Reset product form
function resetProductForm() {
    editingProductId = null;
    currentImageFile = null;

    const form = document.getElementById('productForm');
    if (form) form.reset();

    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.style.display = 'none';
        imagePreview.innerHTML = '';
    }

    const formTitle = document.getElementById('formTitle');
    if (formTitle) formTitle.textContent = 'Tambah Produk Baru';

    const submitBtnText = document.getElementById('submitButtonText');
    if (submitBtnText) submitBtnText.textContent = '✓ Simpan Produk';

    const cancelBtn = document.getElementById('cancelButton');
    if (cancelBtn) cancelBtn.style.display = 'none';
}

// Handle category form submit
async function handleCategorySubmit(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '⏳ Menyimpan...';
    submitBtn.disabled = true;

    try {
        const categoryData = {
            name: document.getElementById('categoryName').value.trim().toUpperCase(),
            display_order: parseInt(document.getElementById('categoryOrder').value) || 0
        };

        if (editingCategoryId) {
            // Update existing category
            const { error } = await supabase
                .from(SUPABASE_CONFIG.tables.categories)
                .update(categoryData)
                .eq('id', editingCategoryId);

            if (error) throw error;
            showAlert('Kategori berhasil diperbarui', 'success');
        } else {
            // Create new category
            const { error } = await supabase
                .from(SUPABASE_CONFIG.tables.categories)
                .insert([categoryData]);

            if (error) throw error;
            showAlert('Kategori berhasil ditambahkan', 'success');
        }

        resetCategoryForm();
        loadCategories();
    } catch (error) {
        console.error('Error saving category:', error);
        showAlert('Gagal menyimpan kategori: ' + error.message, 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Edit category
async function editCategory(categoryId) {
    const category = allCategories.find(c => c.id == categoryId);
    if (!category) return;

    editingCategoryId = category.id;

    const nameInput = document.getElementById('categoryName');
    if (nameInput) nameInput.value = category.name;

    const orderInput = document.getElementById('categoryOrder');
    if (orderInput) orderInput.value = category.display_order || 0;

    const formTitle = document.getElementById('categoryFormTitle');
    if (formTitle) formTitle.textContent = 'Edit Kategori';

    const submitBtnText = document.getElementById('categorySubmitButtonText');
    if (submitBtnText) submitBtnText.textContent = '✓ Update Kategori';

    const cancelBtn = document.getElementById('categoryCancelButton');
    if (cancelBtn) cancelBtn.style.display = 'block';

    // Switch to categories tab
    switchTab('categories');

    // Scroll to form
    const formCard = document.querySelector('.form-card');
    if (formCard) formCard.scrollIntoView({ behavior: 'smooth' });
}

// ... (deleteCategory function remains unchanged) ...

// Reset category form
function resetCategoryForm() {
    editingCategoryId = null;

    const form = document.getElementById('categoryForm');
    if (form) form.reset();

    const formTitle = document.getElementById('categoryFormTitle');
    if (formTitle) formTitle.textContent = 'Tambah Kategori Baru';

    const submitBtnText = document.getElementById('categorySubmitButtonText');
    if (submitBtnText) submitBtnText.textContent = '✓ Simpan Kategori';

    const cancelBtn = document.getElementById('categoryCancelButton');
    if (cancelBtn) cancelBtn.style.display = 'none';
}

// Show alert message
function showAlert(message, type = 'success') {
    const container = document.getElementById('alertContainer');
    if (!container) return;

    const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
    const icon = type === 'success' ? '✓' : '⚠️';

    container.innerHTML = `
        <div class="alert ${alertClass}">
            ${icon} ${message}
        </div>
    `;

    setTimeout(() => {
        container.innerHTML = '';
    }, 3000);
}

// Format price with thousands separator
function formatPrice(price) {
    return parseFloat(price).toLocaleString('id-ID');
}
