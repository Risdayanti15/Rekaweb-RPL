import "./Kelompok.css";
import logo from "./assets/logo.png";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotifBell from "./NotifBell";

function Kelompok() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ nama: "", deskripsi: "", matkul: "", anggota: "", status: "" });
  const [editForm, setEditForm] = useState({ nama: "", deskripsi: "", matkul: "", anggota: "", status: "" });

  const [popup, setPopup] = useState({ show: false, message: "", type: "success" });
  const [confirmModal, setConfirmModal] = useState({ show: false, type: "", targetId: null });

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
      const res = await fetch(`http://localhost:3001/api/groups?userId=${user.id}`);
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      console.error("Gagal ambil kelompok:", err);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) { navigate("/"); return; }
    fetchGroups();
  }, []);

  const handleLogout = () => {
    setConfirmModal({ show: true, type: "logout", targetId: null });
  };

  const handleHapus = (id) => {
    setConfirmModal({ show: true, type: "hapus", targetId: id });
  };

  const handleConfirmYes = async () => {
    const { type, targetId } = confirmModal;
    setConfirmModal({ show: false, type: "", targetId: null });

    if (type === "logout") {
      localStorage.removeItem("user");
      navigate("/");
      return;
    }

    if (type === "hapus") {
      try {
        const res = await fetch(`http://localhost:3001/api/groups/${targetId}`, { method: "DELETE" });
        if (res.ok) {
          showPopup("Kelompok berhasil dihapus! ✓");
          fetchGroups();
        } else {
          showPopup("Gagal menghapus kelompok!", "error");
        }
      } catch (err) {
        showPopup("Tidak dapat terhubung ke server!", "error");
      }
    }
  };

  const handleConfirmCancel = () => {
    setConfirmModal({ show: false, type: "", targetId: null });
  };

  const handleTambah = async () => {
    if (!form.nama || !form.matkul || !form.status) {
      showPopup("Nama, mata kuliah, dan status wajib diisi!", "error");
      return;
    }
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const s = statusMap[form.status];
      const res = await fetch("http://localhost:3001/api/groups", {
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
      const res = await fetch(`http://localhost:3001/api/groups/${editTarget.id}`, {
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

  return (
    <div className="kelompok-page">

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
  <li className="active"><span className="menu-icon">👥</span> Kelompok</li>
  <li onClick={() => navigate("/riwayat")}><span className="menu-icon">⏱️</span> Riwayat</li>
  <li onClick={() => navigate("/profil")}><span className="menu-icon">👤</span> Profil</li>
</ul>
      </div>

      {/* MAIN */}
      <div className="main">
        <div className="topbar">
          <div>
            <h2>👥 Tugas Kelompok</h2>
            <p>Kelola tugas bersama tim</p>
          </div>
          <div className="icons">
            <NotifBell />
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className="content">

          {/* SEARCH + TOMBOL TAMBAH */}
          <div className="search-box">
            <input type="text" placeholder="Cari tugas kelompok..." />
            {/* Tombol tambah hanya tampil di desktop */}
            <button className="btn-tambah-desktop" onClick={() => setShowModal(true)}>
              + Tambah Kelompok
            </button>
          </div>

          {/* TABEL HEADER - hanya di desktop */}
          <div className="group-card">
            <div className="group-header desktop-only">
              <span>Nama Kelompok</span>
              <span>Mata Kuliah</span>
              <span>Anggota</span>
              <span>Aksi</span>
            </div>

            {groups.length === 0 ? (
              <p className="empty-msg">Belum ada kelompok.</p>
            ) : (
              groups.map((g, i) => (
                <div className="group-item" key={i}>

                  {/* INFO KELOMPOK */}
                  <div className="group-name">
                    <h4>{g.nama}</h4>
                    <p>{g.deskripsi}</p>
                    {/* Meta info tampil di HP sebagai badge */}
                    <div className="group-meta-mobile">
                      <span className="meta-badge">📚 {g.matkul}</span>
                      <span className="meta-badge">👥 {g.anggota}</span>
                      <span className={`meta-badge status-badge status-${g.status?.toLowerCase()}`}>
                        {g.status}
                      </span>
                    </div>
                  </div>

                  {/* Kolom desktop */}
                  <span className="desktop-only">{g.matkul}</span>
                  <span className="desktop-only">{g.anggota}</span>

                  {/* TOMBOL AKSI */}
                  <div className="aksi-buttons">
                    <button className="btn-edit" onClick={() => handleOpenEdit(g)}>✏️ Edit</button>
                    <button className="btn-hapus" onClick={() => handleHapus(g.id)}>🗑️ Hapus</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Spacer agar konten tidak ketutup bottom nav */}
          <div style={{ height: "80px" }} />
        </div>

        {/* TOMBOL TAMBAH FLOATING - hanya di HP */}
        <div className="fab-container">
          <button className="fab-btn" onClick={() => setShowModal(true)}>
            + Tambah Kelompok
          </button>
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
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
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
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
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

      {/* MODAL KONFIRMASI */}
      {confirmModal.show && (
        <div className="modal-overlay" onClick={handleConfirmCancel}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">
              {confirmModal.type === "logout" ? "⚠️" : "🗑️"}
            </div>
            <h3>
              {confirmModal.type === "logout" ? "Yakin ingin keluar?" : "Yakin ingin menghapus kelompok ini?"}
            </h3>
            <p>
              {confirmModal.type === "logout"
                ? "Kamu akan keluar dari sesi TaskFlow ini."
                : "Tindakan ini tidak dapat dibatalkan."}
            </p>
            <div className="confirm-footer">
              <button className="btn-cancel" onClick={handleConfirmCancel}>Batal</button>
              <button
                className={confirmModal.type === "hapus" ? "btn-confirm-danger" : "btn-submit"}
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

export default Kelompok;