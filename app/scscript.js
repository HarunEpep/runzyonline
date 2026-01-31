// ===================================
// SCRIPT BOT - ADMIN PANEL & FEATURES
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    // ===== ADMIN CONFIGURATION =====
   

    // ===== DOM ELEMENTS =====
    const adminLoginModal = document.getElementById('adminLoginModal');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const closeLoginBtn = document.getElementById('closeLoginBtn');
    const adminUsername = document.getElementById('adminUsername');
    const adminPassword = document.getElementById('adminPassword');
    const addScriptModal = document.getElementById('addScriptModal');
    const addScriptForm = document.getElementById('addScriptForm');
    const closeAddScriptBtn = document.getElementById('closeAddScriptBtn');
    const navActions = document.getElementById('navActions');
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');

    // ===== MODAL & BUTTONS =====
    adminLoginModal.classList.add('hidden');
    addScriptModal.classList.add('hidden');

    const adminPanel = document.getElementById('adminPanel');
    const addScriptBtn = document.getElementById('addScriptBtn');

    let adminLoginToggle, logoutBtn;
    function createAdminButtons() {
        navActions.innerHTML = '';
        adminLoginToggle = document.createElement('button');
        adminLoginToggle.id = 'adminLoginToggle';
        adminLoginToggle.className = 'btn-admin-access';
        adminLoginToggle.innerHTML = '<i class="fas fa-lock"></i> Admin';
        navActions.appendChild(adminLoginToggle);
        logoutBtn = document.createElement('button');
        logoutBtn.id = 'logoutBtn';
        logoutBtn.className = 'btn-logout hidden';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        navActions.appendChild(logoutBtn);

        adminLoginToggle.addEventListener('click', function() {
            adminLoginModal.classList.remove('hidden');
            adminUsername.focus();
        });

        logoutBtn.addEventListener('click', function() {
            sessionStorage.removeItem('isAdmin');
            adminLoginForm.reset();
            hideAdminUI();
            showNotification('Logout berhasil!', 'success');
        });
    }
    createAdminButtons();

    // ===== FIREBASE LOGIC =====
    const db = firebase.database();
    const auth = firebase.auth();

    // ====== CRUD SCRIPT DARI FIREBASE ======
    function fetchScriptsFromFirebase(callback) {
        db.ref('scripts').once('value', (snapshot) => {
            const val = snapshot.val();
            const arr = val ? Object.entries(val).map(([id, data]) => ({ id, ...data })) : [];
            callback(arr);
        });
    }

    function addScriptToFirebase(script, callback) {
        const ref = db.ref('scripts').push();
        ref.set(script, callback);
    }

    function deleteScriptFromFirebase(id, callback) {
        db.ref('scripts/' + id).remove(callback);
    }

    // ====== RENDER SCRIPTS (FIREBASE) ======
    function renderScripts() {
        const scriptListContainer = document.getElementById('scriptListContainer');
        const isAdmin = !!auth.currentUser;
        const waNumber = '6285194572459';
        scriptListContainer.innerHTML = '';
        fetchScriptsFromFirebase((scripts) => {
            scripts.forEach(script => {
                const scriptCard = document.createElement('div');
                scriptCard.className = 'script-card';
                // build features html
                const featuresHtml = (script.features || []).map(f => `<span><i class=\"fas fa-check\"></i> ${f}</span>`).join(' ');
                // gambar
                let imgHtml = '';
                if (script.image) {
                    imgHtml = `<div class=\"script-img-wrap\"><img src=\"${script.image}\" alt=\"${script.name}\" class=\"script-img\"></div>`;
                }
                scriptCard.innerHTML = `
                    ${imgHtml}
                    <div class=\"script-header\">
                        <h3>${script.name}</h3>
                        <span class=\"badge ${script.badge || 'badge-new'}\">${script.badge ? script.badge.replace('badge-', '') : 'new'}</span>
                    </div>
                    <p>${script.desc}</p>
                    <div class=\"script-features\">${featuresHtml}</div>
                    <div class=\"script-links\">
                        <a href=\"${script.github}\" class=\"btn-link btn-preview\" target=\"_blank\"><i class=\"fab fa-youtube\"></i> Preview</a>
                        <a href=\"https://wa.me/${waNumber}?text=Halo%20saya%20mau%20beli%20script%20${encodeURIComponent(script.name)}\" class=\"btn btn-beli\" target=\"_blank\"><i class=\"fab fa-whatsapp\"></i> Beli</a>
                    </div>
                `;
                if (isAdmin) {
                    const delBtn = document.createElement('button');
                    delBtn.className = 'btn-delete';
                    delBtn.textContent = 'Hapus';
                    delBtn.addEventListener('click', function() {
                        deleteScriptFromFirebase(script.id, renderScripts);
                    });
                    scriptCard.appendChild(delBtn);
                }
                scriptListContainer.appendChild(scriptCard);
            });
        });
    }

    // ====== TAMBAH SCRIPT (FIREBASE) ======
    addScriptForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const fileInput = document.getElementById('scriptImage');
        const urlInput = document.getElementById('scriptImageUrl');
        let imageUrl = '';
        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            imageUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.onerror = err => reject(err);
                reader.readAsDataURL(file);
            });
        } else if (urlInput.value) {
            imageUrl = urlInput.value;
        }
        const newScript = {
            name: document.getElementById('scriptName').value,
            category: document.getElementById('scriptCategory').value,
            desc: document.getElementById('scriptDesc').value,
            features: document.getElementById('scriptFeatures').value.split(',').map(f => f.trim()),
            badge: document.getElementById('scriptBadge').value,
            github: document.getElementById('scriptGithub').value,
            link: document.getElementById('scriptLink').value,
            image: imageUrl
        };
        addScriptToFirebase(newScript, function(err) {
            if (!err) {
                addScriptForm.reset();
                addScriptModal.classList.add('hidden');
                renderScripts();
            }
        });
    });

    // ===== ADMIN LOGIN (FIREBASE AUTH) =====
    adminLoginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = adminUsername.value.trim();
        const password = adminPassword.value;
        if (!username || !password) {
            showNotification('Masukkan email dan password', 'danger');
            return;
        }
        try {
            await auth.signInWithEmailAndPassword(username, password);
            adminLoginModal.classList.add('hidden');
            adminLoginForm.reset();
            showNotification('Login berhasil!', 'success');
            showAdminUI();
        } catch (err) {
            let msg = 'Login gagal: ';
            if (err.code === 'auth/user-not-found') msg += 'Email tidak terdaftar.';
            else if (err.code === 'auth/wrong-password') msg += 'Password salah.';
            else if (err.code === 'auth/invalid-email') msg += 'Format email tidak valid.';
            else msg += err.message;
            showNotification(msg, 'danger');
            hideAdminUI();
        }
    });

    logoutBtn?.addEventListener('click', function() {
        auth.signOut().then(() => {
            showNotification('Logout berhasil!', 'success');
            hideAdminUI();
        });
    });

    function showAdminUI() {
        adminLoginToggle?.classList?.add('hidden');
        logoutBtn?.classList?.remove('hidden');
        adminPanel?.classList?.remove('hidden');
        renderScripts();
    }
    function hideAdminUI() {
        adminLoginToggle?.classList?.remove('hidden');
        logoutBtn?.classList?.add('hidden');
        adminPanel?.classList?.add('hidden');
        renderScripts();
    }

    // ===== NOTIFICATION =====
    function showNotification(message, type) {
        if (!notification || !notificationText) return;
        notificationText.textContent = message;
        notification.className = 'notification ' + type;
        notification.classList.remove('hidden');
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 2000);
    }

    // ===== BUTTONS =====
    closeLoginBtn.addEventListener('click', function() {
        adminLoginModal.classList.add('hidden');
    });
    closeAddScriptBtn.addEventListener('click', function() {
        addScriptModal.classList.add('hidden');
    });

    // ===== INITIAL UI STATE =====
    auth.onAuthStateChanged(function(user) {
        if (user) {
            showAdminUI();
        } else {
            hideAdminUI();
        }
    });

    // ===== RENDER SCRIPT LIST SAAT LOAD =====
    renderScripts();
});
