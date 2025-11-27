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
        const { data, error } = await supabase
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
        const { data, error } = await supabase
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

// ... (skipping unchanged parts) ...

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

    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryOrder').value = category.display_order || 0;

    document.getElementById('categoryFormTitle').textContent = 'Edit Kategori';
    document.getElementById('categorySubmitButtonText').textContent = '✓ Update Kategori';
    document.getElementById('categoryCancelButton').style.display = 'block';

    // Switch to categories tab
    switchTab('categories');

    // Scroll to form
    document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth' });
}

// Delete category
async function deleteCategory(categoryId, categoryName) {
    if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${categoryName}"?`)) {
        return;
    }

    try {
        // Check if category is used by any products
        const productsWithCategory = allProducts.filter(p => p.kategori === categoryName);
        if (productsWithCategory.length > 0) {
            showAlert(`Kategori tidak dapat dihapus karena masih digunakan oleh ${productsWithCategory.length} produk`, 'error');
            return;
        }

        const { error } = await supabase
            .from(SUPABASE_CONFIG.tables.categories)
            .delete()
            .eq('id', categoryId);

        if (error) throw error;

        showAlert('Kategori berhasil dihapus', 'success');
        loadCategories();
    } catch (error) {
        console.error('Error deleting category:', error);
        showAlert('Gagal menghapus kategori: ' + error.message, 'error');
    }
}

// Reset category form
function resetCategoryForm() {
    editingCategoryId = null;

    document.getElementById('categoryForm').reset();
    document.getElementById('categoryFormTitle').textContent = 'Tambah Kategori Baru';
    document.getElementById('categorySubmitButtonText').textContent = '✓ Simpan Kategori';
    document.getElementById('categoryCancelButton').style.display = 'none';
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
