// Global state
let allProducts = [];
let allCategories = [];
let currentCategory = 'ALL';
let searchQuery = '';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
	loadCategories();
	loadProducts();
	initializeEventListeners();
});

// Initialize event listeners
function initializeEventListeners() {
	// Search
	const searchInput = document.getElementById('searchInput');
	if (searchInput) {
		searchInput.addEventListener('input', (e) => {
			searchQuery = e.target.value.toLowerCase();
			filterProducts();
		});
	}

	// Close modal on outside click
	const modal = document.getElementById('productModal');
	if (modal) {
		modal.addEventListener('click', (e) => {
			if (e.target.id === 'productModal') {
				closeModal();
			}
		});
	}
}

// Load categories from Supabase
async function loadCategories() {
	try {
		const { data, error } = await window.supabaseClient
			.from(SUPABASE_CONFIG.tables.categories)
			.select('*')
			.order('display_order', { ascending: true });

		if (error) throw error;

		allCategories = data || [];
		displayCategories(allCategories);
	} catch (error) {
		console.error('Error loading categories:', error);
		// Use default categories if loading fails
		allCategories = [
			{ name: 'DIOSYS & Y2000' },
			{ name: 'GIP' },
			{ name: 'SOFTLENS' },
			{ name: 'BLESSING' },
			{ name: 'MELANIE' },
			{ name: 'TUFT & LUMI' },
			{ name: 'RIDHA' },
			{ name: 'TAKEDA & LUMINIQUE' },
			{ name: 'BESTZ 3G' },
			{ name: 'PERLENGKAPAN' },
			{ name: 'LAIN LAIN' },
			{ name: 'AKSESORIS' },
			{ name: 'BEAUTICA' }
		];
		displayCategories(allCategories);
	}
}

// Display categories in sidebar
function displayCategories(categories) {
	const categoryList = document.getElementById('categoryList');
	if (!categoryList) return;

	// Clear existing categories except "Semua Produk"
	categoryList.innerHTML = '<li class="category-item active" data-category="ALL">Semua Produk</li>';

	// Sort categories by display_order if available
	const sortedCategories = [...categories].sort((a, b) => {
		const orderA = a.display_order || 0;
		const orderB = b.display_order || 0;
		return orderA - orderB;
	});

	// Add categories
	sortedCategories.forEach(category => {
		const li = document.createElement('li');
		li.className = 'category-item';
		li.dataset.category = category.name;
		li.textContent = category.name;
		li.addEventListener('click', handleCategoryClick);
		categoryList.appendChild(li);
	});
}

// Handle category click
function handleCategoryClick(e) {
	// Update active state
	document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
	e.target.classList.add('active');

	// Update current category
	currentCategory = e.target.dataset.category;

	// Update section title
	const title = currentCategory === 'ALL' ? 'Semua Produk' : currentCategory;
	const sectionTitle = document.querySelector('.section-title');
	if (sectionTitle) {
		sectionTitle.textContent = title;
	}

	// Filter products
	filterProducts();
}

// Load products from Supabase
async function loadProducts() {
	try {
		const { data, error } = await window.supabaseClient
			.from(SUPABASE_CONFIG.tables.products)
			.select('*')
			.order('created_at', { ascending: false })
			.limit(1000);

		if (error) throw error;

		allProducts = data || [];
		displayProducts(allProducts);
	} catch (error) {
		console.error('Error loading products:', error);
		showError('Gagal memuat produk. Pastikan Anda terhubung ke internet.');
	}
}

// Filter products based on category and search
function filterProducts() {
	let filtered = allProducts;

	// Filter by category
	if (currentCategory !== 'ALL') {
		filtered = filtered.filter(p => p.kategori === currentCategory);
	}

	// Filter by search query
	if (searchQuery) {
		filtered = filtered.filter(p =>
			p['nama produk'].toLowerCase().includes(searchQuery) ||
			p.kategori.toLowerCase().includes(searchQuery)
		);
	}

	displayProducts(filtered);
}

// Display products in grid
function displayProducts(products) {
	const container = document.getElementById('productsContainer');
	const countElement = document.getElementById('productCount');

	if (!container) return;

	// Update count
	if (countElement) {
		countElement.textContent = `${products.length} Produk`;
	}

	if (products.length === 0) {
		container.innerHTML = `
			<div class="empty-state">
				<div class="empty-state-icon">📦</div>
				<div class="empty-state-text">Tidak ada produk ditemukan</div>
			</div>
		`;
		return;
	}

	const grid = document.createElement('div');
	grid.className = 'products-grid';

	products.forEach((product, index) => {
		const card = createProductCard(product, index);
		grid.appendChild(card);
	});

	container.innerHTML = '';
	container.appendChild(grid);
}

// Create product card element
function createProductCard(product, index) {
	const card = document.createElement('div');
	card.className = 'product-card';
	card.style.animationDelay = `${index * 0.05}s`;
	// Get image URL from Supabase Storage
	const imageUrl = product.gambar ? getImagePreview(product.gambar, 400, 400) : null;
	const fullImageUrl = product.gambar ? getImageUrl(product.gambar) : null;
	const imageContent = imageUrl ?
		`<img src="${imageUrl}" alt="${product['nama produk']}" class="product-img-thumb" data-fullimg="${fullImageUrl}" onerror="this.parentElement.innerHTML='🖼️'">` :
		'🖼️';

	card.innerHTML = `
		<div class="product-image">${imageContent}</div>
		<div class="product-info">
			<span class="product-category">${product.kategori}</span>
			<h3 class="product-name">${product['nama produk']}</h3>
			<div class="product-price">Rp ${formatPrice(product.harga)}</div>
		</div>
	`;

	// Click on card shows product detail
	card.onclick = () => showProductDetail(product);
	// Click on image shows full image modal
	const imgElem = card.querySelector('.product-img-thumb');
	if (imgElem) {
		imgElem.onclick = (e) => {
			e.stopPropagation();
			showFullImageModal(imgElem.dataset.fullimg, product['nama produk']);
		};
	}
	return card;
}

// Show product detail modal
function showProductDetail(product) {
	const modal = document.getElementById('productModal');
	const modalTitle = document.getElementById('modalTitle');
	const modalBody = document.getElementById('modalBody');

	if (!modal || !modalTitle || !modalBody) return;

	modalTitle.textContent = product['nama produk'];

	// Get image URL from Supabase Storage
	const imageUrl = product.gambar ? getImageUrl(product.gambar) : null;
	const imageContent = imageUrl ?
		`<img src="${imageUrl}" alt="${product['nama produk']}" class="modal-image" onerror="this.style.display='none'">` :
		'<div class="modal-image" style="display: flex; align-items: center; justify-content: center; font-size: 5rem;">🖼️</div>';

	modalBody.innerHTML = `
		${imageContent}
		<div style="margin-bottom: 1rem;">
			<span class="product-category">${product.kategori}</span>
		</div>
		<h3 style="font-size: 1.5rem; margin-bottom: 1rem;">${product['nama produk']}</h3>
		<div style="font-size: 2rem; font-weight: 700; margin-bottom: 1rem; background: var(--secondary-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
			Rp ${formatPrice(product.harga)}
		</div>
		<div style="color: var(--text-secondary); font-size: 0.9rem;">
			ID Produk: ${product.id}
		</div>
	`;

	modal.classList.add('active');
	document.body.style.overflow = 'hidden';
}

// Show full image modal
function showFullImageModal(imageUrl, altText) {
	const modal = document.getElementById('productModal');
	const modalTitle = document.getElementById('modalTitle');
	const modalBody = document.getElementById('modalBody');
	if (!modal || !modalTitle || !modalBody) return;
	modalTitle.textContent = altText || 'Gambar Produk';
	modalBody.innerHTML = `<img src="${imageUrl}" alt="${altText}" class="modal-image-full" style="width:100%;max-width:800px;display:block;margin:auto;" onerror="this.onerror=null;this.src='https://via.placeholder.com/800x600?text=Gambar+tidak+tersedia';">`;
	modal.classList.add('active');
	document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
	const modal = document.getElementById('productModal');
	if (modal) {
		modal.classList.remove('active');
		document.body.style.overflow = '';
	}
}

// Format price with thousands separator
function formatPrice(price) {
	return parseFloat(price).toLocaleString('id-ID');
}

// Show error message
function showError(message) {
	const container = document.getElementById('productsContainer');
	if (container) {
		container.innerHTML = `
			<div class="empty-state">
				<div class="empty-state-icon">⚠️</div>
				<div class="empty-state-text">${message}</div>
			</div>
		`;
	}
}
