// Login API dinonaktifkan, gunakan Firebase Auth di frontend
export default function handler(req, res) {
  return res.status(403).json({ success: false, message: 'Login API dinonaktifkan, gunakan login Firebase Auth.' });
}
