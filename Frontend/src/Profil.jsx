import logo from "./assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import NotifBell from "./NotifBell";
import "./Dashboard.css";
import "./Profil.css";

function Profil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/"); return; }
      try {
        const response = await fetch("https://rekaweb-rpl-production.up.railway.app/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) { navigate("/"); return; }
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        navigate("/");
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => setShowConfirmLogout(true);

  const handleConfirmLogoutYes = () => {
    setShowConfirmLogout(false);
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleConfirmLogoutCancel = () => setShowConfirmLogout(false);

  const formatTanggal = (val) => {
    if (!val) return "-";
    return new Date(val).toLocaleDateString("id-ID", {
      day: "2-digit", month: "long", year: "numeric",
    });
  };

  return (
    <div className="dashboard">

      {/* SIDEBAR - hanya tampil di desktop */}
      <div className="sidebar">
        <div className="logo-area">
          <img src={logo} alt="logo" />
          <h2>TaskFlow</h2>
        </div>
        <ul className="menu">
  <li onClick={() => navigate("/dashboard")}>
    <span className="menu-icon">🏠</span> Dashboard
  </li>
  <li onClick={() => navigate("/tugas")}>
    <span className="menu-icon">📋</span> Tugas
  </li>
  <li onClick={() => navigate("/kelompok")}>
    <span className="menu-icon">👥</span> Kelompok
  </li>
  <li onClick={() => navigate("/riwayat")}>
    <span className="menu-icon">⏱️</span> Riwayat
  </li>
  <li className="active">
    <span className="menu-icon">👤</span> Profil
  </li>
</ul>
      </div>

      {/* MAIN */}
      <div className="main">

        {/* HEADER */}
        <div className="header">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Cari..." />
          </div>
          <div className="icons">
            <NotifBell />
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="profil-page">
          <h2 className="profil-page-title">Profil Saya</h2>

          {!user ? (
            <p style={{ color: "#888", fontSize: 14, textAlign: "center" }}>Memuat data...</p>
          ) : (
            <div className="profil-card">

              {/* AVATAR */}
              <div className="profil-avatar-wrap">
                <div className="profil-avatar-circle">👤</div>
                <h3 className="profil-name">{user.name}</h3>
                <p className="profil-email">{user.email}</p>
              </div>

              <div className="profil-divider" />

              {/* INFORMASI UTAMA */}
              <p className="profil-section-title">INFORMASI UTAMA</p>
              <div className="profil-row">
                <span className="profil-label">Nama Lengkap</span>
                <span className="profil-value">{user.name || "-"}</span>
              </div>
              <div className="profil-row">
                <span className="profil-label">Username</span>
                <span className={`profil-value ${!user.username ? "empty" : ""}`}>
                  {user.username || "Belum diisi"}
                </span>
              </div>
              <div className="profil-row">
                <span className="profil-label">Email</span>
                <span className="profil-value">{user.email}</span>
              </div>

              <div className="profil-divider" />

              {/* INFORMASI DETAIL */}
              <p className="profil-section-title">INFORMASI DETAIL</p>
              <div className="profil-row">
                <span className="profil-label">No. Telepon</span>
                <span className={`profil-value ${!user.phone ? "empty" : ""}`}>
                  {user.phone || "Belum diisi"}
                </span>
              </div>
              <div className="profil-row">
                <span className="profil-label">Alamat</span>
                <span className={`profil-value ${!user.address ? "empty" : ""}`}>
                  {user.address || "Belum diisi"}
                </span>
              </div>
              <div className="profil-row">
                <span className="profil-label">Tanggal Lahir</span>
                <span className={`profil-value ${!user.birthdate ? "empty" : ""}`}>
                  {formatTanggal(user.birthdate)}
                </span>
              </div>
              <div className="profil-row">
                <span className="profil-label">Jenis Kelamin</span>
                <span className={`profil-value ${!user.gender ? "empty" : ""}`}>
                  {user.gender || "Belum diisi"}
                </span>
              </div>

              <button
                className="profil-edit-btn"
                onClick={() => navigate("/profil/edit")}
              >
                ✏️ Edit Profil
              </button>

            </div>
          )}
        </div>

        {/* Spacer agar konten tidak ketutup bottom nav */}
        <div style={{ height: "80px" }} />
      </div>

      {/* BOTTOM NAVIGATION - hanya tampil di HP */}
      <div className="bottom-nav">
  <button className="bottom-nav-item" onClick={() => navigate("/dashboard")}>
    <span className="bottom-nav-icon">🏠</span>
    <span className="bottom-nav-label">Dashboard</span>
  </button>
  <button className="bottom-nav-item" onClick={() => navigate("/tugas")}>
    <span className="bottom-nav-icon">📋</span>
    <span className="bottom-nav-label">Tugas</span>
  </button>
  <button className="bottom-nav-item" onClick={() => navigate("/kelompok")}>
    <span className="bottom-nav-icon">👥</span>
    <span className="bottom-nav-label">Kelompok</span>
  </button>
  <button className="bottom-nav-item" onClick={() => navigate("/riwayat")}>
    <span className="bottom-nav-icon">⏱️</span>
    <span className="bottom-nav-label">Riwayat</span>
  </button>
  <button className="bottom-nav-item active">
    <span className="bottom-nav-icon">👤</span>
    <span className="bottom-nav-label">Profil</span>
  </button>
</div>

      {/* MODAL KONFIRMASI LOGOUT */}
      {showConfirmLogout && (
        <div className="modal-overlay" onClick={handleConfirmLogoutCancel}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">⚠️</div>
            <h3>Yakin ingin keluar?</h3>
            <p>Kamu akan keluar dari sesi TaskFlow ini.</p>
            <div className="confirm-footer">
              <button className="btn-cancel" onClick={handleConfirmLogoutCancel}>Batal</button>
              <button className="profil-edit-btn" onClick={handleConfirmLogoutYes}>Ya, Keluar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Profil;