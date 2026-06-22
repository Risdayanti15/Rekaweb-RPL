import "./App.css";
import gambar from "./assets/gambar.png";
import logo from "./assets/logo.png";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function App() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="container"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
    >

      {/* Navbar */}
      <div className="navbar">
        <img src={logo} alt="logo" className="logo" />
        <div className="nav-text">
          <span>Sistem Manajemen </span>
          <strong>Tugas Mahasiswa</strong>
        </div>
      </div>

      {/* Hero */}
      <div className="hero">

        <div className="text">
          <h1>
            Selamat Datang <br />
            Sistem Manajemen <br />
            <span>Tugas Mahasiswa</span>
          </h1>
          <p className="subtitle"></p>
        </div>

        {/* Animasi gambar */}
        <motion.div
          className="image"
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img src={gambar} alt="hero" />
        </motion.div>

      </div>

      {/* Button */}
      <div className="button-wrapper">
        <button onClick={() => navigate("/login")}>
          Klik di sini untuk lanjut →
        </button>
      </div>

    </motion.div>
  );
}

export default App;