import "./Register.css";
import logo from "./assets/logo.png";
import ilustrasi from "./assets/gambar.png";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Password dan konfirmasi password tidak sama!");
      return;
    }
    try {
      const response = await fetch("https://rekaweb-rpl-production.up.railway.app/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setShowSuccess(true); // tampilkan popup sukses
      } else {
        alert(data.message || "Registrasi gagal!");
      }
    } catch (error) {
      alert("Tidak dapat terhubung ke server!");
    }
  };

  return (
    <div className="register-container">

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
                  <circle cx="26" cy="26" r="26" fill="#2ECC9A"/>
                  <path d="M14 27L22 35L38 19" stroke="white" strokeWidth="4"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="success-title">Success</h2>
              <p className="success-msg">Registrasi berhasil! Silakan login ke akun Anda 🎉</p>
              <div className="success-actions">
                <button className="btn-cancel" onClick={() => setShowSuccess(false)}>
                  Cancel
                </button>
                <button className="btn-login" onClick={() => navigate("/login")}>
                  Login
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
          <h2>Registrasi</h2>
          <p>Buat akun anda</p>
          <input
            type="text"
            placeholder="Nama Lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
          <input
            type="password"
            placeholder="Konfirmasi Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button onClick={handleRegister}>Daftar</button>
          <p className="login-text">
            Sudah punya akun?{" "}
            <span onClick={() => navigate("/login")}>Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;