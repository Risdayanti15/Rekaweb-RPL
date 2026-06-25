import "./Kelompok.css";
import logo from "./assets/logo.png";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function Kelompok() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ nama: "", deskripsi: "", matkul: "", anggota: "", status: "" });
  const [editForm, setEditForm] = useState({ nama: "", deskripsi: "", matkul: "", anggota: "", status: "" });
  const [showNotif, setShowNotif] = useState(false);
  const [tasks, setTasks] = useState([]);
  const notifRef = useRef(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [popup, setPopup] = useState({ show: false, message: "", type: "success" });
  const [confirmHapus, setConfirmHapus] = useState({ show: false, targetId: null });

  const showPopup = (message, type = "success") => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: "", type: "success" }), 2500);
  };

  const statusMap = {
    aktif: { label: "Aktif" },
    progress: { label: "Progress" },
    selesai: { label: "Selesai" },
  };

  const fetchGroups = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await fetch(`https://rekaweb-rpl-production.up.railway.app/api/groups?userId=${user.id}`);
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      console.error("Gagal ambil kelompok:", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await fetch(`https://rekaweb-rpl-production.up.railway.app/api/tasks?userId=${user.id}`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Gagal ambil tugas:", err);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) { navigate("/"); return; }
    fetchGroups();
    fetchTasks();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Notif logic ──
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

  const formatDeadline = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

  const handleLogout = () => setShowLogoutConfirm(true);
  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    localStorage.removeItem("user");
    navigate("/");
  };
  const handleCancelLogout = () => setShowLogoutConfirm(false);

  const handleHapus = (id) => setConfirmHapus({ show: true, targetId: id });
  const handleCancelHapus = () => setConfirmHapus({ show: false, targetId: null });
  const handleConfirmHapus = async () => {
    const id = confirmHapus.targetId;
    setConfirmHapus({ show: false, targetId: null });
    try {
      const res = await fetch(`https://rekaweb-rpl-production.up.railway.app/api/groups/${id}`, { method: "DELETE" });
      if (res.ok) {
        showPopup("Kelompok berhasil dihapus! ✓");
        fetchGroups();
      } else {
        showPopup("Gagal menghapus kelompok!", "error");
      }
    } catch (err) {
      showPopup("Tidak dapat terhubung ke server!", "error");
    }
  };

  const handleTambah = async () => {
    if (!form.nama || !form.matkul || !form.status) {
      showPopup("Nama, mata kuliah, dan status wajib diisi!", "error");
      return;
    }
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const s = statusMap[form.status];
      const res = await fetch("https://rekaweb-rpl-production.up.railway.app/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: user.id,
          nama: form.nama,
          deskripsi: form.deskripsi,
          matkul: form.matkul,
          anggota: `${form.anggota} Orang`,
          status: s.label,
        }),
      });
      if (res.ok) {
        showPopup("Kelompok berhasil disimpan! ✓");
        setForm({ nama: "", deskripsi: "", matkul: "", anggota: "", status: "" });
        setShowModal(false);
        fetchGroups();
      } else {
        showPopup("Gagal menyimpan kelompok!", "error");
      }
    } catch (err) {
      showPopup("Tidak dapat terhubung ke server!", "error");
    }
  };

  const handleOpenEdit = (g) => {
    setEditTarget(g);
    const statusKey = Object.keys(statusMap).find(k => statusMap[k].label === g.status) || "aktif";
    const anggotaNum = g.anggota ? g.anggota.replace(" Orang", "") : "";
    setEditForm({ nama: g.nama, deskripsi: g.deskripsi, matkul: g.matkul, anggota: anggotaNum, status: statusKey });
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!editForm.nama || !editForm.matkul || !editForm.status) {
      showPopup("Nama, mata kuliah, dan status wajib diisi!", "error");
      return;
    }
    try {
      const s = statusMap[editForm.status];
      const res = await fetch(`https://rekaweb-rpl-production.up.railway.app/api/groups/${editTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: editForm.nama,
          deskripsi: editForm.deskripsi,
          matkul: editForm.matkul,
          anggota: `${editForm.anggota} Orang`,
          status: s.label,
        }),
      });
      if (res.ok) {
        showPopup("Kelompok berhasil diperbarui! ✓");
        setShowEditModal(false);
        fetchGroups();
      } else {
        showPopup("Gagal memperbarui kelompok!", "error");
      }
    } catch (err) {
      showPopup("Tidak dapat terhubung ke server!", "error");
    }
  };

  const filteredGroups = groups.filter(
    (g) =>
      g.nama.toLowerCase().includes(search.toLowerCase()) ||
      g.matkul.toLowerCase().includes(search.toLowerCase())
  );

  // ── Style helpers (sama dengan Dashboard) ──
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

  const modalBoxStyle = {
    background: "#fff",
    borderRadius: "16px",
    padding: "20px",
    width: "90%",
    maxWidth: "480px",
    marginTop: "16px",
    marginBottom: "16px",
    boxSizing: "border-box",
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
    <div className="kelompok-page">

      {/* POPUP TOAST */}
      {popup.show && (
        <div className={`popup-toast ${popup.type}`}>
          <span className="popup-icon">{popup.type === "success" ? "✅" : "❌"}</span>
          <span className="popup-msg">{popup.message}</span>
        </div>
      )}

      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="logo-area">
          <img src={logo} alt="logo" />
          <h2>TaskFlow</h2>
        </div>
        <ul className="menu">
          <li onClick={() => navigate("/dashboard")}><span className="menu-icon">🏠</span> Dashboard</li>
          <li onClick={() => navigate("/tugas")}><span className="menu-icon">📋</span> Tugas</li>
          <li className="active"><span className="menu-icon">👥</span> Kelompok</li>
          <li onClick={() => navigate("/riwayat")}><span className="menu-icon">⏱️</span> Riwayat</li>
          <li onClick={() => navigate("/profil")}><span className="menu-icon">👤</span> Profil</li>
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
              placeholder="Cari kelompok..."
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
          <h2>Tugas Kelompok 👥</h2>

          {/* TABEL HEADER - hanya di desktop */}
          <div className="group-card">
            <div className="group-header desktop-only">
              <span>Nama Kelompok</span>
              <span>Mata Kuliah</span>
              <span>Anggota</span>
              <span>Aksi</span>
            </div>

            {filteredGroups.length === 0 ? (
              <p className="empty-msg">Belum ada kelompok.</p>
            ) : (
              filteredGroups.map((g, i) => (
                <div className="group-item" key={i}>
                  <div className="group-name">
                    <h4>{g.nama}</h4>
                    <p>{g.deskripsi}</p>
                    <div className="group-meta-mobile">
                      <span className="meta-badge">📚 {g.matkul}</span>
                      <span className="meta-badge">👥 {g.anggota}</span>
                      <span className={`meta-badge status-badge status-${g.status?.toLowerCase()}`}>
                        {g.status}
                      </span>
                    </div>
                  </div>
                  <span className="desktop-only">{g.matkul}</span>
                  <span className="desktop-only">{g.anggota}</span>
                  <div className="aksi-buttons">
                    <button className="btn-edit" onClick={() => handleOpenEdit(g)}>✏️ Edit</button>
                    <button className="btn-hapus" onClick={() => handleHapus(g.id)}>🗑️ Hapus</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ height: "80px" }} />
        </div>

        {/* TOMBOL TAMBAH FLOATING */}
        <div className="fab-container">
          <button className="fab-btn" onClick={() => setShowModal(true)}>
            + Tambah Kelompok
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

        {/* MODAL KONFIRMASI HAPUS */}
        {confirmHapus.show && (
          <div style={overlayStyle} onClick={handleCancelHapus}>
            <div style={confirmBoxStyle} onClick={(e) => e.stopPropagation()}>
              <div className="confirm-icon">🗑️</div>
              <h3 className="confirm-title">Hapus Kelompok</h3>
              <p className="confirm-message">Yakin ingin menghapus kelompok ini?<br />Tindakan ini tidak dapat dibatalkan.</p>
              <div className="confirm-actions">
                <button className="confirm-btn-no" onClick={handleCancelHapus}>Tidak</button>
                <button className="confirm-btn-yes" onClick={handleConfirmHapus}>Ya, Hapus</button>
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
        <button className="bottom-nav-item" onClick={() => navigate("/tugas")}>
          <span className="bottom-nav-icon">📋</span>
          <span className="bottom-nav-label">Tugas</span>
        </button>
        <button className="bottom-nav-item active">
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

      {/* MODAL TAMBAH */}
      {showModal && (
        <div style={overlayStyle} onClick={() => setShowModal(false)}>
          <div style={modalBoxStyle} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tambah Kelompok Baru</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="form-group">
              <label>Nama Kelompok</label>
              <input type="text" placeholder="Contoh: Project UI/UX"
                value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Deskripsi</label>
              <input type="text" placeholder="Contoh: Desain aplikasi mobile"
                value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Mata Kuliah</label>
              <input type="text" placeholder="Contoh: IMK"
                value={form.matkul} onChange={e => setForm({ ...form, matkul: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Jumlah Anggota</label>
              <input type="number" placeholder="Contoh: 5" min="1"
                value={form.anggota} onChange={e => setForm({ ...form, anggota: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="">Pilih status...</option>
                <option value="aktif">Aktif</option>
                <option value="progress">Progress</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Batal</button>
              <button className="btn-submit" onClick={handleTambah}>Simpan Kelompok</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT */}
      {showEditModal && (
        <div style={overlayStyle} onClick={() => setShowEditModal(false)}>
          <div style={modalBoxStyle} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Kelompok</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className="form-group">
              <label>Nama Kelompok</label>
              <input type="text" value={editForm.nama}
                onChange={e => setEditForm({ ...editForm, nama: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Deskripsi</label>
              <input type="text" value={editForm.deskripsi}
                onChange={e => setEditForm({ ...editForm, deskripsi: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Mata Kuliah</label>
              <input type="text" value={editForm.matkul}
                onChange={e => setEditForm({ ...editForm, matkul: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Jumlah Anggota</label>
              <input type="number" min="1" value={editForm.anggota}
                onChange={e => setEditForm({ ...editForm, anggota: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={editForm.status}
                onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                <option value="">Pilih status...</option>
                <option value="aktif">Aktif</option>
                <option value="progress">Progress</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>Batal</button>
              <button className="btn-submit" onClick={handleEdit}>Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Kelompok;
