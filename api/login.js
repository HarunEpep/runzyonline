export default function handler(req, res) {
  // Hanya izinkan metode POST (untuk kirim data)
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Metode tidak diizinkan' });
  }

  const { username, password } = req.body;

  // ===== DATABASE ADMIN (AMAN DI SERVER) =====
  const ADMIN_USERNAME = 'admin@runzy.online';
  const ADMIN_PASSWORD = 'strunzynglz1982'; // Password kamu aman di sini

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Jika benar, kirim status sukses
    return res.status(200).json({ 
      success: true, 
      message: 'Login Berhasil' 
    });
  } else {
    // Jika salah, kirim status error
    return res.status(401).json({ 
      success: false, 
      message: 'Username atau password salah' 
    });
  }
}
