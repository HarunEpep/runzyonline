// ===================================
// SCRIPT BOT - ADMIN PANEL SYSTEM
// ===================================

// Password Admin (ganti sesuai kebutuhan)
const ADMIN_PASSWORD = "admin123";

// Key untuk localStorage
const STORAGE_KEY = "runzy_scripts_data";
const AUTH_KEY = "runzy_admin_auth";

// Default data (hanya untuk inisialisasi pertama kali)
const defaultScripts = [
    {
        name: "Baileys WhatsApp Bot",
        image: "https://via.placeholder.com/300x180",
        badge: "badge-new",
        badgeText: "Populer",
        description: "Bot WhatsApp multi-device dengan fitur lengkap dan stabil",
        features: ["Multi-Device Support", "Auto Reply", "Download Media"],
        youtubeLink: "https://youtube.com/@runzynglz",
        waNumber: "6285194572459"
    },
    {
        name: "Telegram Bot Advanced",
        image: "https://via.placeholder.com/300x180",
        badge: "badge-hot",
        badgeText: "Hot",
        description: "Bot Telegram dengan fitur admin panel dan database",
        features: ["Admin Panel", "Database MySQL", "Auto Broadcast"],
        youtubeLink: "https://youtube.com/@runzynglz",
        waNumber: "6285194572459"
    },
    {
        name: "Discord Music Bot",
        image: "https://via.placeholder.com/300x180",
        badge: "badge-updated",
        badgeText: "Update",
        description: "Bot Discord untuk memutar musik dengan kualitas HD",
        features: ["HD Audio Quality", "Queue System", "Playlist Support"],
        youtubeLink: "https://youtube.com/@runzynglz",
        waNumber: "6285194572459"
    }
];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize
    initializeData();
    checkAuthStatus();
    setupEventListeners();
    renderScripts();

    // ====== INITIALIZE DATA ======
    function initializeData() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            // First time, save default data
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultScripts));
        }
    }

    // ====== GET SCRIPTS FROM LOCALSTORAGE ======
    function getScripts() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    // ====== SAVE SCRIPTS TO LOCALSTORAGE ======
    function saveScripts(scripts) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scripts));
    }

    // ====== CHECK AUTH STATUS ======
    function checkAuthStatus() {
        const isAuth = sessionStorage.getItem(AUTH_KEY) === 'true';
        if (isAuth) {
            showAdminUI();
        } else {
            hideAdminUI();
        }
        return isAuth;
    }

    // ====== SHOW/HIDE ADMIN UI ======
    function showAdminUI() {
        document.getElementById('adminLoginToggle')?.classList.add('hidden');
        document.getElementById('logoutBtn')?.classList.remove('hidden');
        document.getElementById('adminPanel')?.classList.remove('hidden');
        renderScripts();
    }

    function hideAdminUI() {
        document.getElementById('adminLoginToggle')?.classList.remove('hidden');
        document.getElementById('logoutBtn')?.classList.add('hidden');
        document.getElementById('adminPanel')?.classList.add('hidden');
        renderScripts();
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
            if (script.image) {
                imgHtml = `<div class="script-img-wrap"><img src="${script.image}" alt="${script.name}" class="script-img"></div>`;
            }

            // Build WhatsApp message
            const waMessage = `Halo%20saya%20mau%20beli%20script%20${encodeURIComponent(script.name)}`;

            scriptCard.innerHTML = `
                ${imgHtml}
                <div class="script-header">
                    <h3>${script.name}</h3>
                    <span class="badge ${script.badge}">${script.badgeText}</span>
                </div>
                <p>${script.description}</p>
                <div class="script-features">${featuresHtml}</div>
                <div class="script-links">
                    <a href="${script.youtubeLink}" class="btn-link btn-preview" target="_blank">
                        <i class="fab fa-youtube"></i> Preview
                    </a>
                    <a href="https://wa.me/${script.waNumber}?text=${waMessage}" class="btn btn-beli" target="_blank">
                        <i class="fab fa-whatsapp"></i> Beli
                    </a>
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
        document.getElementById('editIndex').value = index;

        document.getElementById('scriptName').value = script.name;
        document.getElementById('scriptImageUrl').value = script.image || '';
        document.getElementById('scriptBadge').value = script.badge;
        document.getElementById('scriptBadgeText').value = script.badgeText;
        document.getElementById('scriptDesc').value = script.description;
        document.getElementById('scriptFeatures').value = script.features.join(', ');
        document.getElementById('scriptYoutube').value = script.youtubeLink;
        document.getElementById('scriptWaNumber').value = script.waNumber;

        document.getElementById('addScriptModal').classList.remove('hidden');
    }

    // ====== DELETE SCRIPT ======
    function deleteScript(index) {
        if (confirm('Apakah Anda yakin ingin menghapus script ini?')) {
            const scripts = getScripts();
            scripts.splice(index, 1);
            saveScripts(scripts);
            renderScripts();
            showNotification('Script berhasil dihapus!', 'success');
        }
    }

    // ====== SETUP EVENT LISTENERS ======
    function setupEventListeners() {
        // Admin login toggle
        const adminLoginToggle = document.getElementById('adminLoginToggle');
        if (adminLoginToggle) {
            adminLoginToggle.addEventListener('click', function() {
                console.log('Admin button clicked');
                document.getElementById('adminLoginModal').classList.remove('hidden');
                document.getElementById('adminPassword').focus();
            });
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
                const password = document.getElementById('adminPassword').value;
                
                console.log('Login attempt...');
                
                if (password === ADMIN_PASSWORD) {
                    sessionStorage.setItem(AUTH_KEY, 'true');
                    document.getElementById('adminLoginModal').classList.add('hidden');
                    document.getElementById('adminLoginForm').reset();
                    showAdminUI();
                    showNotification('Login berhasil! Sekarang Anda bisa mengelola script.', 'success');
                    console.log('Login success');
                } else {
                    showNotification('Password salah! Coba lagi.', 'danger');
                    console.log('Wrong password');
                    document.getElementById('adminPassword').value = '';
                    document.getElementById('adminPassword').focus();
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
            addScriptForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const editIndex = document.getElementById('editIndex').value;
                const newScript = {
                    name: document.getElementById('scriptName').value.trim(),
                    image: document.getElementById('scriptImageUrl').value.trim() || 'https://via.placeholder.com/300x180',
                    badge: document.getElementById('scriptBadge').value,
                    badgeText: document.getElementById('scriptBadgeText').value.trim(),
                    description: document.getElementById('scriptDesc').value.trim(),
                    features: document.getElementById('scriptFeatures').value.split(',').map(f => f.trim()).filter(f => f),
                    youtubeLink: document.getElementById('scriptYoutube').value.trim(),
                    waNumber: document.getElementById('scriptWaNumber').value.trim()
                };

                const scripts = getScripts();
                
                if (editIndex !== '') {
                    // Update existing
                    scripts[parseInt(editIndex)] = newScript;
                    showNotification('Script berhasil diupdate!', 'success');
                } else {
                    // Add new
                    scripts.push(newScript);
                    showNotification('Script berhasil ditambahkan!', 'success');
                }

                saveScripts(scripts);
                document.getElementById('addScriptModal').classList.add('hidden');
                document.getElementById('addScriptForm').reset();
                renderScripts();
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