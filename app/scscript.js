// ===================================
// SCRIPT BOT - DISPLAY ONLY
// ===================================

// Firebase Modular Imports (v10)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCGs-W8aNzfEidTbA9J77CL92ZahJqn8_I",
  authDomain: "runzyweb.firebaseapp.com",
  databaseURL: "https://runzyweb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "runzyweb",
  storageBucket: "runzyweb.firebasestorage.app",
  messagingSenderId: "701587941397",
  appId: "1:701587941397:web:94c2390a6e5d40d0e2061c",
  measurementId: "G-XD4KLX0DYD"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.addEventListener('DOMContentLoaded', function() {

    // ====== FETCH SCRIPTS FROM FIREBASE ======
    function fetchScriptsFromFirebase(callback) {
      onValue(ref(db, 'scripts'), (snapshot) => {
        const val = snapshot.val();
        const arr = val ? Object.entries(val).map(([id, data]) => ({ id, ...data })) : [];
        callback(arr);
      });
    }

    // ====== RENDER SCRIPTS (FIREBASE) ======
    function renderScripts() {
        const scriptListContainer = document.getElementById('scriptListContainer');
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
                scriptListContainer.appendChild(scriptCard);
            });
        });
    }

    // ===== RENDER SCRIPT LIST SAAT LOAD =====
    renderScripts();
});
