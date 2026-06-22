import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "./assets/logo.png";
import NotifBell from "./NotifBell";
import "./Dashboard.css";
import "./Riwayat.css";

function Riwayat() {
  const navigate = useNavigate();
  const [tugas, setTugas] = useState([]);
  const [kelompok, setKelompok] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("semua");

  const [popup, setPopup] = useState({ show: false, message: "", type: "success" });
  const [confirmModal, setConfirmModal] = useState({ show: false, type: "", targetId: null });

  const showPopup = (message, type = "success") => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: "", type: "success" }), 2500);
  };

  const fetchData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) { navigate("/"); return; }
      const [resTugas, resKelompok] = await Promise.all([
        fetch(`https://rekaweb-rpl-production.up.railway.app/api/tasks?userId=${user.id}`),
        fetch(`https://rekaweb-rpl-production.up.railway.app/api/groups?userId=${user.id}`),
      ]);
      const dataTugas = await resTugas.json();
      const dataKelompok = await resKelompok.json();
      setTugas(Array.isArray(dataTugas) ? dataTugas : []);
      setKelompok(Array.isArray(dataKelompok) ? dataKelompok : []);
    } catch (err) {
      console.error("Gagal ambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogout = () => {
    setConfirmModal({ show: true, type: "logout", targetId: null });
  };

  const handleHapusTugas = (id) => {
    setConfirmModal({ show: true, type: "tugas", targetId: id });
  };

  const handleHapusKelompok = (id) => {
    setConfirmModal({ show: true, type: "kelompok", targetId: id });
  };

  const handleConfirmYes = async () => {
    const { type, targetId } = confirmModal;
    setConfirmModal({ show: false, type: "", targetId: null });

    if (type === "logout") {
      localStorage.removeItem("user");
      navigate("/");
      return;
    }

    if (type === "tugas") {
      try {
        const res = await fetch(`https://rekaweb-rpl-production.up.railway.app/api/tasks/${targetId}`, { method: "DELETE" });
        if (res.ok) {
          setTugas(prev => prev.filter(t => t.id !== targetId));
          showPopup("Tugas berhasil dihapus! ✓");
        } else {
          showPopup("Gagal menghapus tugas!", "error");
        }
      } catch {
        showPopup("Tidak dapat terhubung ke server!", "error");
      }
      return;
    }

    if (type === "kelompok") {
      try {
        const res = await fetch(`https://rekaweb-rpl-production.up.railway.app/api/groups/${targetId}`, { method: "DELETE" });
        if (res.ok) {
          setKelompok(prev => prev.filter(k => k.id !== targetId));
          showPopup("Kelompok berhasil dihapus! ✓");
        } else {
          showPopup("Gagal menghapus kelompok!", "error");
        }
      } catch {
        showPopup("Tidak dapat terhubung ke server!", "error");
      }
    }
  };

  const handleConfirmCancel = () => {
    setConfirmModal({ show: false, type: "", targetId: null });
  };

  const combined = [
    ...tugas.filter(t => t.status?.toLowerCase() === "selesai").map(t => ({ ...t, tipe: "tugas" })),
    ...kelompok.filter(k => k.status?.toLowerCase() === "selesai").map(k => ({ ...k, tipe: "kelompok" })),
  ];

  const filtered = combined.filter(item => {
    const matchFilter = filter === "semua" || item.tipe === filter;
    const keyword = search.toLowerCase();
    const matchSearch =
      (item.nama || item.title || "").toLowerCase().includes(keyword) ||
      (item.matkul || item.subject || "").toLowerCase().includes(keyword) ||
      (item.deskripsi || item.description || "").toLowerCase().includes(keyword);
    return matchFilter && matchSearch;
  });

  return (
    <div className="dashboard">

      {/* POPUP NOTIFIKASI */}
      {popup.show && (
        <div className={`popup-toast ${popup.type}`}>
          <span className="popup-icon">{popup.type === "success" ? "✅" : "❌"}</span>
          <span className="popup-msg">{popup.message}</span>
        </div>
      )}

      {/* SIDEBAR - hanya tampil di desktop */}
      <div className="sidebar">
        <div className="logo-area">
          <img src={logo} alt="logo" />
          <h2>TaskFlow</h2>
        </div>
        <ul className="menu">
  <li onClick={() => navigate("/dashboard")}><span className="menu-icon">🏠</span> Dashboard</li>
  <li onClick={() => navigate("/tugas")}><span className="menu-icon">📋</span> Tugas</li>
  <li onClick={() => navigate("/kelompok")}><span className="menu-icon">👥</span> Kelompok</li>
  <li className="active"><span className="menu-icon">⏱️</span> Riwayat</li>
  <li onClick={() => navigate("/profil")}><span className="menu-icon">👤</span> Profil</li>
</ul>
      </div>

      {/* MAIN */}
      <div className="main">

        {/* HEADER */}
        <div className="header">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Cari berdasarkan nama, mata kuliah..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="icons">
            <NotifBell />
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="content">
          <h2 className="riwayat-title">⏱️ Riwayat Tugas</h2>

          {/* FILTER TABS */}
          <div className="riwayat-filter-tabs">
            <button
              className={`filter-btn ${filter === "semua" ? "active" : ""}`}
              onClick={() => setFilter("semua")}
            >
              Semua
            </button>
            <button
              className={`filter-btn ${filter === "tugas" ? "active" : ""}`}
              onClick={() => setFilter("tugas")}
            >
              📋 Tugas
            </button>
            <button
              className={`filter-btn ${filter === "kelompok" ? "active" : ""}`}
              onClick={() => setFilter("kelompok")}
            >
              👥 Kelompok
            </button>
          </div>

          {/* LIST */}
          {loading ? (
            <p className="riwayat-loading">⏳ Memuat data...</p>
          ) : filtered.length === 0 ? (
            <div className="riwayat-empty">
              <div style={{ fontSize: 40 }}>📭</div>
              <p>Belum ada tugas yang selesai.</p>
            </div>
          ) : (
            <div className="riwayat-list">
              {filtered.map((item, i) => (
                <div className="riwayat-card" key={i}>

                  {/* INFO */}
                  <div className="riwayat-left">
                    <div className="riwayat-title-row">
                      <strong className="riwayat-name">
                        {item.tipe === "tugas" ? (item.title || item.nama) : item.nama}
                      </strong>
                      <div className="riwayat-badges">
                        <span className={`riwayat-badge ${item.tipe}`}>
                          {item.tipe === "tugas" ? "📋 Tugas" : "👥 Kelompok"}
                        </span>
                        {item.status && (
                          <span className={`status-badge ${item.status?.toLowerCase()}`}>
                            {item.status}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="riwayat-meta">
                      {(item.matkul || item.subject) && (
                        <span>📚 {item.matkul || item.subject}</span>
                      )}
                      {(item.deskripsi || item.description) && (
                        <span>📝 {item.deskripsi || item.description}</span>
                      )}
                      {item.anggota && <span>👤 {item.anggota}</span>}
                      {(item.deadline || item.tanggal) && (
                        <span>📅 {item.deadline || item.tanggal}</span>
                      )}
                    </div>
                  </div>

                  {/* TOMBOL HAPUS */}
                  <div className="riwayat-actions">
                    <button
                      className="hapus-btn"
                      onClick={() =>
                        item.tipe === "tugas"
                          ? handleHapusTugas(item.id)
                          : handleHapusKelompok(item.id)
                      }
                    >
                      🗑️ Hapus
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

          {/* Spacer agar konten tidak ketutup bottom nav */}
          <div style={{ height: "80px" }} />
        </div>
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
  <button className="bottom-nav-item active">
    <span className="bottom-nav-icon">⏱️</span>
    <span className="bottom-nav-label">Riwayat</span>
  </button>
  <button className="bottom-nav-item" onClick={() => navigate("/profil")}>
    <span className="bottom-nav-icon">👤</span>
    <span className="bottom-nav-label">Profil</span>
  </button>
</div>


      {/* MODAL KONFIRMASI */}
      {confirmModal.show && (
        <div className="modal-overlay" onClick={handleConfirmCancel}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">
              {confirmModal.type === "logout" ? "⚠️" : "🗑️"}
            </div>
            <h3>
              {confirmModal.type === "logout"
                ? "Yakin ingin keluar?"
                : confirmModal.type === "tugas"
                ? "Yakin ingin menghapus tugas ini?"
                : "Yakin ingin menghapus kelompok ini?"}
            </h3>
            <p>
              {confirmModal.type === "logout"
                ? "Kamu akan keluar dari sesi TaskFlow ini."
                : "Tindakan ini tidak dapat dibatalkan."}
            </p>
            <div className="confirm-footer">
              <button className="btn-cancel" onClick={handleConfirmCancel}>Batal</button>
              <button
                className={confirmModal.type === "logout" ? "btn-confirm" : "btn-confirm-danger"}
                onClick={handleConfirmYes}
              >
                {confirmModal.type === "logout" ? "Ya, Keluar" : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Riwayat;
