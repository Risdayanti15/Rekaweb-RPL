import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { AnimatePresence } from "framer-motion";

// ===== IMPORT HALAMAN =====
import App from "./App.jsx";
import Register from "./Register.jsx";
import Login from "./Login.jsx";
import Dashboard from "./Dashboard.jsx";
import Tugas from "./Tugas.jsx";
import Kelompok from "./Kelompok.jsx";
import Profil from "./Profil.jsx";
import EditProfil from "./EditProfil.jsx"; // ← tambah ini
import Riwayat from "./Riwayat.jsx";

// ===== ROUTE ANIMATION =====
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* LANDING PAGE */}
        <Route path="/" element={<App />} />

        {/* AUTH */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* MAIN PAGE */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tugas" element={<Tugas />} />
        <Route path="/kelompok" element={<Kelompok />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/profil/edit" element={<EditProfil />} /> {/* ← tambah ini */}
        <Route path="/riwayat" element={<Riwayat />} />
      </Routes>
    </AnimatePresence>
  );
}

// ===== RENDER APP =====
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  </StrictMode>
);