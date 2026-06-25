import "./Tugas.css";
import logo from "./assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import ModalTugas from "./ModalTugas";

function Tugas() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [editTask, setEditTask] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [popup, setPopup] = useState({
    show: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: null,
  });

  const showPopup = (type, title, message, onConfirm = null) => {
    setPopup({ show: true, type, title, message, onConfirm });
  };

  const closePopup = () => {
    setPopup({ show: false, type: "info", title: "", message: "", onConfirm: null });
  };

  const fetchTasks = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`https://rekaweb-rpl-production.up.railway.app/api/tasks?userId=${user.id}`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Gagal ambil tugas:", error);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Notif logic (sama persis dengan Dashboard) ──
  const getSisaHari = (deadline) => {
    if (!deadline) return null;
    const diff = new Date(deadline) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const notifTasks = tasks.filter((t) => {
    if (t.status === "Selesai") return false;
    const sisa = getSisaHari(t.deadline);
    return sisa !== null && sisa >= 0 && sisa <= 7;
  }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const getNotifColor = (sisa) => {
    if (sisa <= 2) return "#e53935";
    if (sisa <= 4) return "#f7931e";
    return "#2d7dd2";
  };

  const getNotifLabel = (sisa) => {
    if (sisa === 0) return "Deadline hari ini!";
    if (sisa === 1) return "Deadline besok!";
    return `Sisa ${sisa} hari lagi`;
  };

  const handleLogout = () => setShowLogoutConfirm(true);
  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    localStorage.removeItem("user");
    navigate("/");
  };
  const handleCancelLogout = () => setShowLogoutConfirm(false);

  const handleSimpan = async (form) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await fetch("https://rekaweb-rpl-production.up.railway.app/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.namaTugas,
          description: form.deskripsi,
          deadline: form.deadline,
          status: form.status,
          type: form.mataKuliah,
          userId: user.id,
        }),
      });
      if (response.ok) {
        fetchTasks();
        setShowModal(false);
        showPopup("success", "Berhasil!", "Tugas berhasil disimpan.");
      } else {
        showPopup("error", "Gagal", "Gagal menyimpan tugas. Coba lagi.");
      }
    } catch (error) {
      showPopup("error", "Koneksi Error", "Tidak dapat terhubung ke server.");
    }
  };

  const handleUpdate = async (form) => {
    try {
      const response = await fetch(`https://rekaweb-rpl-production.up.railway.app/api/tasks/${editTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.namaTugas,
          description: form.deskripsi,
          deadline: form.deadline,
          status: form.status,
          type: form.mataKuliah,
        }),
      });
      if (response.ok) {
        fetchTasks();
        setEditTask(null);
        setShowModal(false);
        showPopup("success", "Berhasil!", "Tugas berhasil diupdate.");
      } else {
        showPopup("error", "Gagal", "Gagal mengupdate tugas. Coba lagi.");
      }
    } catch (error) {
      showPopup("error", "Koneksi Error", "Tidak dapat terhubung ke server.");
    }
  };

  const handleHapus = (id) => {
    showPopup("confirm", "Hapus Tugas", "Yakin ingin menghapus tugas ini? Tindakan ini tidak bisa dibatalkan.", async () => {
      try {
        const response = await fetch(`https://rekaweb-rpl-production.up.railway.app/api/tasks/${id}`, { method: "DELETE" });
        if (response.ok) {
          fetchTasks();
          showPopup("success", "Terhapus!", "Tugas berhasil dihapus.");
        } else {
          showPopup("error", "Gagal", "Gagal menghapus tugas.");
        }
      } catch (error) {
        showPopup("error", "Koneksi Error", "Tidak dapat terhubung ke server.");
      }
    });
  };

  const formatDeadline = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    if (status === "Belum") return "blue";
    if (status === "Proses") return "orange";
    if (status === "Selesai") return "green";
    return "blue";
  };

  const getStatusLabel = (status) => {
    if (status === "Belum") return "Belum dikerjakan";
    if (status === "Proses") return "Sementara dikerjakan";
    if (status === "Selesai") return "Selesai";
    return status;
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.type.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filteredTasks.reduce((acc, task) => {
    const key = task.type || "Umum";
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});

  const popupIcon = { success: "✅", error: "❌", confirm: "⚠️", info: "ℹ️" };

  // ── Style overlay & confirm box (sama dengan Dashboard) ──
  const overlayStyle = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1000,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    overflowY: "auto",
    paddingTop: "env(safe-area-inset-top, 16px)",
    paddingBottom: "80px",
    WebkitOverflowScrolling: "touch",
  };

  const confirmBoxStyle = {
    background: "#fff",
    borderRadius: "16px",
    padding: "28px 20px",
    width: "85%",
    maxWidth: "360px",
    marginTop: "30vh",
    marginBottom: "16px",
    textAlign: "center",
    boxSizing: "border-box",
  };

  return (
    <div className="tugas-page">

      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="logo-area">
          <img src={logo} alt="logo" />
          <h2>TaskFlow</h2>
        </div>
        <ul className="menu">
          <li onClick={() => navigate("/dashboard")}>
            <span className="menu-icon">🏠</span> Dashboard
          </li>
          <li className="active">
            <span className="menu-icon">📋</span> Tugas
          </li>
          <li onClick={() => navigate("/kelompok")}>
            <span className="menu-icon">👥</span> Kelompok
          </li>
          <li onClick={() => navigate("/riwayat")}>
            <span className="menu-icon">⏱️</span> Riwayat
          </li>
          <li onClick={() => navigate("/profil")}>
            <span className="menu-icon">👤</span> Profil
          </li>
        </ul>
      </div>

      {/* MAIN */}
      <div className="main" style={{ position: "relative" }}>

        {/* ── HEADER — sama persis dengan Dashboard ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 16px",
          background: "#fff",
          boxSizing: "border-box",
          width: "100%",
          position: "relative",
          zIndex: 10,
        }}>
          {/* Search bar */}
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            background: "#f4f4f4",
            borderRadius: "10px",
            padding: "8px 12px",
            gap: "6px",
            minWidth: 0,
          }}>
            <span style={{ fontSize: "16px", flexShrink: 0 }}>🔍</span>
            <input
              type="text"
              placeholder="Cari tugas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: "13px",
                color: "#333",
                width: "100%",
                minWidth: 0,
              }}
            />
          </div>

          {/* Notif Bell */}
          <div ref={notifRef} style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={() => setShowNotif(!showNotif)}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                border: "1px solid #e0e0e0",
                background: "#fff",
                fontSize: "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                flexShrink: 0,
              }}
            >
              🔔
              {notifTasks.length > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "#e53935",
                  color: "#fff",
                  fontSize: "9px",
                  fontWeight: "700",
                  borderRadius: "50%",
                  width: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {notifTasks.length}
                </span>
              )}
            </button>

            {/* Dropdown notif */}
            {showNotif && (
              <div style={{
                position: "absolute",
                top: "46px",
                right: "0",
                width: "290px",
                maxWidth: "85vw",
                background: "#fff",
                borderRadius: "14px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                zIndex: 999,
                overflow: "hidden",
              }}>
                <div style={{
                  padding: "12px 16px",
                  fontWeight: "600",
                  fontSize: "13px",
                  borderBottom: "1px solid #f0f0f0",
                  background: "#f8f8f8",
                }}>
                  🔔 Notifikasi Deadline
                </div>
                {notifTasks.length === 0 ? (
                  <div style={{ padding: "16px", fontSize: "13px", color: "#888", textAlign: "center" }}>
                    Tidak ada deadline mendekat 🎉
                  </div>
                ) : (
                  notifTasks.map((task) => {
                    const sisa = getSisaHari(task.deadline);
                    return (
                      <div key={task.id} style={{ padding: "10px 16px", borderBottom: "1px solid #f0f0f0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                          <span style={{ fontWeight: "600", fontSize: "12px", color: "#333" }}>{task.title}</span>
                          <span style={{ color: getNotifColor(sisa), fontSize: "11px", fontWeight: "600", whiteSpace: "nowrap", marginLeft: "6px" }}>
                            {getNotifLabel(sisa)}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "11px", color: "#888" }}>{task.type}</span>
                          <span style={{ fontSize: "11px", color: "#888" }}>📅 {formatDeadline(task.deadline)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Tombol Logout */}
          <button
            onClick={handleLogout}
            style={{
              height: "38px",
              padding: "0 14px",
              borderRadius: "10px",
              border: "1.5px solid #e53935",
              background: "#fff",
              color: "#e53935",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Logout
          </button>
        </div>

        {/* CONTENT */}
        <div className="content">
          <h2>Daftar Tugas 📋</h2>

          {Object.keys(grouped).length === 0 ? (
            <p className="empty-msg">Belum ada tugas.</p>
          ) : (
            Object.entries(grouped).map(([mataKuliah, taskList]) => (
              <div className="group-card" key={mataKuliah}>
                <div className="group-header">
                  <span className="group-icon">☰</span>
                  <h3>{mataKuliah}</h3>
                </div>
                {taskList.map((task) => (
                  <div className="task-item" key={task.id}>
                    <div className="task-left">
                      <p>{task.title}</p>
                      <span>Deadline: {formatDeadline(task.deadline)}</span>
                      {task.description && (
                        <span style={{ fontSize: "12px", color: "#999", marginTop: "2px", display: "block" }}>
                          {task.description}
                        </span>
                      )}
                    </div>
                    <div className="task-right" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                      <button className={`status ${getStatusClass(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </button>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className="btn-edit"
                          onClick={() => { setEditTask(task); setShowModal(true); }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn-hapus"
                          onClick={() => handleHapus(task.id)}
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}

          <div style={{ height: "80px" }} />
        </div>

        {/* TOMBOL TAMBAH */}
        <div className="bottom-bar">
          <button
            className="btn-tambah"
            onClick={() => { setEditTask(null); setShowModal(true); }}
          >
            + Tambah Tugas
          </button>
        </div>

        {/* MODAL KONFIRMASI LOGOUT */}
        {showLogoutConfirm && (
          <div style={overlayStyle} onClick={handleCancelLogout}>
            <div style={confirmBoxStyle} onClick={(e) => e.stopPropagation()}>
              <div className="confirm-icon">⚠️</div>
              <h3 className="confirm-title">Yakin Ingin Keluar?</h3>
              <p className="confirm-message">Kamu akan keluar dari sesi TaskFlow ini.</p>
              <div className="confirm-actions">
                <button className="confirm-btn-no" onClick={handleCancelLogout}>Tidak</button>
                <button className="confirm-btn-yes" onClick={handleConfirmLogout}>Ya, Keluar</button>
              </div>
            </div>
          </div>
        )}

      </div>{/* end .main */}

      {/* BOTTOM NAVIGATION */}
      <div className="bottom-nav">
        <button className="bottom-nav-item" onClick={() => navigate("/dashboard")}>
          <span className="bottom-nav-icon">🏠</span>
          <span className="bottom-nav-label">Dashboard</span>
        </button>
        <button className="bottom-nav-item active">
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
        <button className="bottom-nav-item" onClick={() => navigate("/profil")}>
          <span className="bottom-nav-icon">👤</span>
          <span className="bottom-nav-label">Profil</span>
        </button>
      </div>

      {/* MODAL TAMBAH/EDIT TUGAS */}
      {showModal && (
        <ModalTugas
          onClose={() => { setShowModal(false); setEditTask(null); }}
          onSimpan={editTask ? handleUpdate : handleSimpan}
          editData={editTask}
        />
      )}

      {/* CUSTOM POPUP */}
      {popup.show && (
        <div className="popup-overlay" onClick={popup.type !== "confirm" ? closePopup : undefined}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <div className={`popup-icon-wrap popup-icon-${popup.type}`}>
              <span>{popupIcon[popup.type]}</span>
            </div>
            <h3 className="popup-title">{popup.title}</h3>
            <p className="popup-message">{popup.message}</p>
            {popup.type === "confirm" ? (
              <div className="popup-actions">
                <button className="popup-btn popup-btn-cancel" onClick={closePopup}>Batal</button>
                <button className="popup-btn popup-btn-confirm"
                  onClick={() => { popup.onConfirm && popup.onConfirm(); closePopup(); }}>
                  Ya, Lanjutkan
                </button>
              </div>
            ) : (
              <button className="popup-btn popup-btn-ok" onClick={closePopup}>OK</button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default Tugas;
