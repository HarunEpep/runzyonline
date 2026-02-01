// ===================================
// SCRIPT BOT - ADMIN PANEL SYSTEM
// ===================================

// Konfigurasi Supabase - SILAKAN GANTI DENGAN PROJECT URL & ANON KEY ANDA
// Buat table di Supabase bernama 'scripts' dengan kolom:
// id (int8, primary key), name, image, badge, badgeText, description, features (json/text), price, youtubeLink, waNumber, downloadLink
const SUPABASE_URL = "https://npwvzkypbhalfmsptlrh.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wd3Z6a3lwYmhhbGZtc3B0bHJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NTA3OTEsImV4cCI6MjA4NTUyNjc5MX0.RV1uUX-ihfOjjT8cryVUdEqD2uiQcYZSKVSdhNSBowg";
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Admin Credentials (ganti sesuai kebutuhan)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

const AUTH_KEY = "runzy_admin_auth";

// Cache untuk menyimpan data dari database secara lokal
let localScripts = [];


document.addEventListener('DOMContentLoaded', function() {
    console.log('Script loaded successfully!');
    
    // Initialize
    updateUIBasedOnAuth();
    setupEventListeners();
    fetchScripts(); // Akan memanggil renderScripts setelah data didapat
    
    console.log('Admin button element:', document.getElementById('adminLoginToggle'));

    // ====== FETCH SCRIPTS FROM SUPABASE ======
    async function fetchScripts() {
        if (!supabaseClient) {
            console.error("Supabase client belum diinisialisasi.");
            return;
        }
        
        try {
            const { data, error } = await supabaseClient
                .from('scripts')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            
            localScripts = data.map(item => ({
                ...item,
                features: typeof item.features === 'string' ? item.features.split(',') : (Array.isArray(item.features) ? item.features : [])
            }));
            
            renderScripts();
        } catch (error) {
            console.error("Error fetching scripts:", error);
            // showNotification("Gagal memuat data", "danger");
        }
    }

    // ====== GET SCRIPTS (LOCALLY CACHED) ======
    function getScripts() {
        return localScripts;
    }

    // ====== SAVE TO SUPABASE (CREATE/UPDATE) ======
    // Fungsi ini diganti logic langsung di event handler untuk support async


    // ====== CHECK AUTH STATUS ======
    function checkAuthStatus() {
        const isAuth = sessionStorage.getItem(AUTH_KEY) === 'true';
        return isAuth;
    }

    // ====== SHOW/HIDE ADMIN UI ======
    function showAdminUI() {
        document.getElementById('adminLoginToggle')?.classList.add('hidden');
        document.getElementById('logoutBtn')?.classList.remove('hidden');
        document.getElementById('adminPanel')?.classList.remove('hidden');
    }

    function hideAdminUI() {
        document.getElementById('adminLoginToggle')?.classList.remove('hidden');
        document.getElementById('logoutBtn')?.classList.add('hidden');
        document.getElementById('adminPanel')?.classList.add('hidden');
    }

    // ====== UPDATE UI BASED ON AUTH ======
    function updateUIBasedOnAuth() {
        const isAuth = checkAuthStatus();
        if (isAuth) {
            showAdminUI();
        } else {
            hideAdminUI();
        }
    }

    // ====== RENDER SCRIPTS ======
    function renderScripts() {
        const scriptListContainer = document.getElementById('scriptListContainer');
        
        if (!scriptListContainer) {
            console.error('Container not found!');
            return;
        }

        const scripts = getScripts();
        const isAdmin = checkAuthStatus();
        
        scriptListContainer.innerHTML = '';

        if (scripts.length === 0) {
            scriptListContainer.innerHTML = '<p style="text-align:center; padding:2rem; color:#666;">Belum ada script. Admin bisa menambahkan script baru.</p>';
            return;
        }

        // Loop through all scripts
        scripts.forEach((script, index) => {
            const scriptCard = document.createElement('div');
            scriptCard.className = 'script-card';
            scriptCard.style.animationDelay = `${(index + 1) * 0.1}s`;

            // Build features HTML
            const featuresHtml = script.features.map(feature => 
                `<span><i class="fas fa-check"></i> ${feature}</span>`
            ).join('');

            // Build image HTML
            let imgHtml = '';
            if (script.image && script.image.trim() !== '') {
                const imageUrl = script.image.startsWith('http') ? script.image : 'https://placehold.co/300x180/e0e0e0/666666/png?text=Script+Image';
                imgHtml = `<div class="script-img-wrap"><img src="${imageUrl}" alt="${script.name}" class="script-img" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'padding:2rem;text-align:center;background:#f3f4f6;border-radius:12px;color:#666;\\'><i class=\\'fas fa-image\\' style=\\'font-size:3rem;margin-bottom:1rem;\\'></i><p>Gambar tidak tersedia</p></div>'"></div>`;
            }

            // Build WhatsApp message
            const waMessage = `Halo%20saya%20mau%20beli%20script%20${encodeURIComponent(script.name)}`;

            // Determine if script has download link (for free scripts)
            const hasDownload = script.downloadLink && script.downloadLink.trim() !== '';
            const buyButtonHtml = hasDownload 
                ? `<a href="${script.downloadLink}" class="btn btn-download" target="_blank">
                       <i class="fas fa-download"></i> Download
                   </a>`
                : `<a href="https://wa.me/${script.waNumber}?text=${waMessage}" class="btn btn-beli" target="_blank">
                       <i class="fab fa-whatsapp"></i> Beli
                   </a>`;

            scriptCard.innerHTML = `
                ${imgHtml}
                <div class="script-header">
                    <h3>${script.name}</h3>
                    <span class="badge ${script.badge}">${script.badgeText}</span>
                </div>
                <p>${script.description}</p>
                <div class="script-price">
                    <i class="fas fa-tag"></i> <strong>${script.price || 'Hubungi Admin'}</strong>
                </div>
                <div class="script-features">${featuresHtml}</div>
                <div class="script-links">
                    <a href="${script.youtubeLink}" class="btn-link btn-preview" target="_blank">
                        <i class="fab fa-youtube"></i> Preview
                    </a>
                    ${buyButtonHtml}
                </div>
            `;

            // Add admin buttons if logged in
            if (isAdmin) {
                const adminButtons = document.createElement('div');
                adminButtons.className = 'admin-buttons';
                adminButtons.innerHTML = `
                    <button class="btn-edit" data-index="${index}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" data-index="${index}">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                `;
                scriptCard.appendChild(adminButtons);
            }

            scriptListContainer.appendChild(scriptCard);
        });

        // Setup admin button listeners
        if (isAdmin) {
            setupAdminButtons();
        }
    }

    // ====== SETUP ADMIN BUTTONS ======
    function setupAdminButtons() {
        // Edit buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                openEditModal(index);
            });
        });

        // Delete buttons
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                deleteScript(index);
            });
        });
    }

    // ====== OPEN EDIT MODAL ======
    function openEditModal(index) {
        const scripts = getScripts();
        const script = scripts[index];

        document.getElementById('modalTitle').textContent = 'Edit Script';
        document.getElementById('submitBtnText').textContent = 'Update Script';
        document.getElementById('editIndex').value = script.id; // Store ID instead of index

        document.getElementById('scriptName').value = script.name;
        document.getElementById('scriptImageUrl').value = script.image || '';
        document.getElementById('scriptBadge').value = script.badge;
        document.getElementById('scriptBadgeText').value = script.badgeText;
        document.getElementById('scriptDesc').value = script.description;
        document.getElementById('scriptFeatures').value = Array.isArray(script.features) ? script.features.join(', ') : script.features;
        document.getElementById('scriptPrice').value = script.price || '';
        document.getElementById('scriptYoutube').value = script.youtubeLink;
        document.getElementById('scriptDownload').value = script.downloadLink || '';
        document.getElementById('scriptWaNumber').value = script.waNumber;

        document.getElementById('addScriptModal').classList.remove('hidden');
    }

    // ====== DELETE SCRIPT ======
    async function deleteScript(index) {
        if (confirm('Apakah Anda yakin ingin menghapus script ini?')) {
            const scripts = getScripts();
            const script = scripts[index];
            
            if (!script || !script.id) {
                showNotification('Gagal menghapus: ID tidak ditemukan', 'danger');
                return;
            }

            try {
                const { error } = await supabaseClient
                    .from('scripts')
                    .delete()
                    .eq('id', script.id);
                
                if (error) throw error;

                showNotification('Script berhasil dihapus!', 'success');
                fetchScripts();
            } catch (error) {
                console.error("Error deleting script:", error);
                showNotification('Gagal menghapus script', 'danger');
            }
        }
    }

    // ====== SETUP EVENT LISTENERS ======
    function setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Admin login toggle
        const adminLoginToggle = document.getElementById('adminLoginToggle');
        console.log('Admin toggle button found:', adminLoginToggle);
        
        if (adminLoginToggle) {
            // Remove any existing listeners
            const newBtn = adminLoginToggle.cloneNode(true);
            adminLoginToggle.parentNode.replaceChild(newBtn, adminLoginToggle);
            
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Admin button clicked!');
                const modal = document.getElementById('adminLoginModal');
                console.log('Modal element:', modal);
                if (modal) {
                    modal.classList.remove('hidden');
                    const passwordField = document.getElementById('adminPassword');
                    if (passwordField) {
                        setTimeout(() => passwordField.focus(), 100);
                    }
                }
            });
            console.log('Admin button event listener attached');
        } else {
            console.error('Admin button not found!');
        }

        // Close login modal
        const closeLoginBtn = document.getElementById('closeLoginBtn');
        if (closeLoginBtn) {
            closeLoginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                document.getElementById('adminLoginModal').classList.add('hidden');
                document.getElementById('adminLoginForm').reset();
            });
        }

        // Admin login form
        const adminLoginForm = document.getElementById('adminLoginForm');
        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const username = document.getElementById('adminUsername').value.trim();
                const password = document.getElementById('adminPassword').value;
                
                console.log('Login attempt...');
                
                if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                    sessionStorage.setItem(AUTH_KEY, 'true');
                    document.getElementById('adminLoginModal').classList.add('hidden');
                    document.getElementById('adminLoginForm').reset();
                    showAdminUI();
                    renderScripts();
                    showNotification('Login berhasil! Selamat datang, ' + username + '!', 'success');
                    console.log('Login success');
                } else {
                    let errorMsg = 'Username atau password salah!';
                    if (username !== ADMIN_USERNAME && password !== ADMIN_PASSWORD) {
                        errorMsg = 'Username dan password salah!';
                    } else if (username !== ADMIN_USERNAME) {
                        errorMsg = 'Username salah!';
                    } else if (password !== ADMIN_PASSWORD) {
                        errorMsg = 'Password salah!';
                    }
                    showNotification(errorMsg, 'danger');
                    console.log('Login failed:', errorMsg);
                    document.getElementById('adminPassword').value = '';
                    document.getElementById('adminUsername').focus();
                }
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                if (confirm('Yakin ingin logout?')) {
                    sessionStorage.removeItem(AUTH_KEY);
                    hideAdminUI();
                    renderScripts();
                    showNotification('Logout berhasil!', 'success');
                }
            });
        }

        // Add script button
        const addScriptBtn = document.getElementById('addScriptBtn');
        if (addScriptBtn) {
            addScriptBtn.addEventListener('click', function() {
                document.getElementById('modalTitle').textContent = 'Tambah Script Baru';
                document.getElementById('submitBtnText').textContent = 'Tambah Script';
                document.getElementById('editIndex').value = '';
                document.getElementById('addScriptForm').reset();
                document.getElementById('addScriptModal').classList.remove('hidden');
            });
        }

        // Close add/edit modal
        const closeAddScriptBtn = document.getElementById('closeAddScriptBtn');
        if (closeAddScriptBtn) {
            closeAddScriptBtn.addEventListener('click', function() {
                document.getElementById('addScriptModal').classList.add('hidden');
                document.getElementById('addScriptForm').reset();
            });
        }

        // Add/Edit script form
        const addScriptForm = document.getElementById('addScriptForm');
        if (addScriptForm) {
            addScriptForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const scriptId = document.getElementById('editIndex').value;
                const newScript = {
                    name: document.getElementById('scriptName').value.trim(),
                    image: document.getElementById('scriptImageUrl').value.trim() || 'https://placehold.co/300x180/e0e0e0/666666/png?text=Script+Image',
                    badge: document.getElementById('scriptBadge').value,
                    badgeText: document.getElementById('scriptBadgeText').value.trim(),
                    description: document.getElementById('scriptDesc').value.trim(),
                    features: document.getElementById('scriptFeatures').value.split(',').map(f => f.trim()).filter(f => f),
                    price: document.getElementById('scriptPrice').value.trim() || 'Hubungi Admin',
                    youtubeLink: document.getElementById('scriptYoutube').value.trim(),
                    downloadLink: document.getElementById('scriptDownload').value.trim() || '',
                    waNumber: document.getElementById('scriptWaNumber').value.trim()
                };

                try {
                    if (scriptId) {
                        // Update existing
                        const { error } = await supabaseClient
                            .from('scripts')
                            .update(newScript)
                            .eq('id', scriptId);
                            
                        if (error) throw error;
                        showNotification('Script berhasil diupdate!', 'success');
                    } else {
                        // Add new
                        const { error } = await supabaseClient
                            .from('scripts')
                            .insert([newScript]);
                            
                        if (error) throw error;
                        showNotification('Script berhasil ditambahkan!', 'success');
                    }

                    document.getElementById('addScriptModal').classList.add('hidden');
                    document.getElementById('addScriptForm').reset();
                    fetchScripts(); // Refresh data from server
                    
                } catch (error) {
                    console.error('Error saving script:', error);
                    showNotification('Gagal menyimpan script', 'danger');
                }
            });
        }

        // Close modals when clicking outside
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                    if (modal.id === 'adminLoginModal') {
                        document.getElementById('adminLoginForm').reset();
                    } else if (modal.id === 'addScriptModal') {
                        document.getElementById('addScriptForm').reset();
                    }
                }
            });
        });
    }

    // ====== NOTIFICATION ======
    function showNotification(message, type = 'success') {
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'flex';
        notification.style.opacity = '1';
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 300);
        }, 3000);
    }

    // Smooth scroll untuk semua link
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});