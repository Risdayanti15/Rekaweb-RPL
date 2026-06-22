import "./Tugas.css";
import logo from "./assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ModalTugas from "./ModalTugas";
import NotifBell from "./NotifBell";

function Tugas() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [editTask, setEditTask] = useState(null);

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
      const response = await fetch(`http://localhost:3001/api/tasks?userId=${user.id}`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Gagal ambil tugas:", error);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleLogout = () => {
    showPopup("confirm", "Keluar", "Yakin ingin keluar dari TaskFlow?", () => {
      localStorage.removeItem("user");
      navigate("/login");
    });
  };

  const handleSimpan = async (form) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await fetch("http://localhost:3001/api/tasks", {
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
      const response = await fetch(`http://localhost:3001/api/tasks/${editTask.id}`, {
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
        const response = await fetch(`http://localhost:3001/api/tasks/${id}`, { method: "DELETE" });
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

  const popupIcon = {
    success: "✅",
    error: "❌",
    confirm: "⚠️",
    info: "ℹ️",
  };

  return (
    <div className="tugas-page">

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
      <div className="main">

        {/* HEADER */}
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-icon">📋</span>
            <h2>Daftar Tugas</h2>
          </div>
          <div className="icons">
            <NotifBell />
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="content">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Cari tugas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

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
                    <div className="task-info">
                      <h4>{task.title}</h4>
                      <p className="task-deadline">Deadline: {formatDeadline(task.deadline)}</p>
                      {task.description && <p className="task-desc">{task.description}</p>}
                    </div>
                    <div className="task-actions">
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
                ))}
              </div>
            ))
          )}

          {/* Spacer agar konten tidak ketutup tombol tambah di HP */}
          <div style={{ height: "80px" }} />
        </div>

        {/* TOMBOL TAMBAH - floating di HP, normal di desktop */}
        <div className="bottom-bar">
          <button
            className="btn-tambah"
            onClick={() => { setEditTask(null); setShowModal(true); }}
          >
            + Tambah Tugas
          </button>
        </div>
      </div>

      {/* BOTTOM NAVIGATION - hanya tampil di HP */}
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
                <button className="popup-btn popup-btn-cancel" onClick={closePopup}>
                  Batal
                </button>
                <button
                  className="popup-btn popup-btn-confirm"
                  onClick={() => { popup.onConfirm && popup.onConfirm(); closePopup(); }}
                >
                  Ya, Lanjutkan
                </button>
              </div>
            ) : (
              <button className="popup-btn popup-btn-ok" onClick={closePopup}>
                OK
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default Tugas;