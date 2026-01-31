// ===================================
// RUNZY NGLZ - INTERAKSI WEB
// ===================================

// Pastikan DOM sudah loaded sebelum eksekusi
document.addEventListener('DOMContentLoaded', function() {

    // ===== HAMBURGER MENU TOGGLE =====
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function(e) {
            e.preventDefault();
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Tutup menu saat link diklik
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // ===== SMOOTH SCROLL UNTUK SEMUA ANCHOR LINKS =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Jika hanya "#", skip
            if (href === '#') {
                return;
            }
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ===== SCROLL PROGRESS BAR (OPTIONAL) =====
    window.addEventListener('scroll', function() {
        // Bisa tambahkan efek saat scroll di sini
    });

}); // End DOMContentLoaded
