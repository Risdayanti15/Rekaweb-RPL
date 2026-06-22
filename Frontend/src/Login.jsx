import "./Login.css";
import logo from "./assets/logo.png";
import ilustrasi from "./assets/gambar.png";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import api from "./api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Email dan password harus diisi!");
      return;
    }
    try {
      // 🚀 SOLUSI 1: Tulis langsung "auth/login" (TANPA garis miring di awal) agar pas melekat di belakang /api
      const response = await api.post("https://rekaweb-rpl-production.up.railway.app/api/auth/login", { email, password });
      
      // 🚀 ATAU SOLUSI 2 (Paling Aman di Vercel): Tulis URL lengkapnya langsung di sini jika solusi 1 masih rewel
      // const response = await api.post("https://rekaweb-rpl-production.up.railway.app/api/auth/login", { email, password });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setShowSuccess(true);
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message || "Login gagal!");
      } else {
        alert("Tidak dapat terhubung ke server!");
      }
    }
  };

  return (
    <div className="login-container">

      {/* POPUP SUCCESS */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="success-box"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="success-icon">
                <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="26" cy="26" r="26" fill="#2f80ed"/>
                  <path d="M14 27L22 35L38 19" stroke="white" strokeWidth="4"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="success-title">Success</h2>
              <p className="success-msg">Woah, login berhasil! Selamat datang 🎉</p>
              <div className="success-actions">
                <button className="btn-cancel" onClick={() => setShowSuccess(false)}>
                  Cancel
                </button>
                <button className="btn-dashboard" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT SIDE */}
      <div className="left">
        <div className="logo-area">
          <img src={logo} alt="logo" />
          <div>
            <p>Sistem Manajemen</p>
            <strong>Tugas Mahasiswa</strong>
          </div>
        </div>
        <div className="illustration">
          <motion.img
            src={ilustrasi}
            alt="ilustrasi"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="right">
        <div className="form-box">
          <h2>Login</h2>
          <p>Masuk ke akun Anda</p>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="extra">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <span className="forgot">Lupa Password?</span>
          </div>
          <button onClick={handleLogin}>Login</button>
          <p className="register-text">
            Belum punya akun?{" "}
            <span onClick={() => navigate("/register")}>Daftar</span>
          </p>
          <div className="google">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="google"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
