import logo from "./assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function EditProfil() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    address: "",
    birthdate: "",
    gender: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load data user saat halaman dibuka
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
        const u = data.user;

        setForm({
          name:      u.name      || "",
          username:  u.username  || "",
          email:     u.email     || "",
          phone:     u.phone     || "",
          address:   u.address   || "",
          birthdate: u.birthdate ? u.birthdate.substring(0, 10) : "",
          gender:    u.gender    || "",
        });

      } catch (error) {
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }

    setSaving(true);
    try {
      const response = await fetch("https://rekaweb-rpl-production.up.railway.app/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name:      form.name,
          username:  form.username,
          phone:     form.phone,
          address:   form.address,
          birthdate: form.birthdate || null,
          gender:    form.gender,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Profil berhasil disimpan!");
        navigate("/profil");
      } else {
        alert(data.message || "Gagal menyimpan profil!");
      }
    } catch (error) {
      alert("Tidak dapat terhubung ke server!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: "Poppins", sans-serif; }

        .edit-page { display: flex; min-height: 100vh; background: #f5f7fa; }

        /* SIDEBAR */
        .edit-sidebar { width: 220px; background: #ffffff; padding: 20px 15px; border-right: 1px solid #e0e0e0; display: flex; flex-direction: column; }
        .edit-logo-area { display: flex; align-items: center; gap: 10px; margin-bottom: 30px; }
        .edit-logo-area img { width: 38px; }
        .edit-logo-area h2 { font-size: 18px; color: #1e3c72; font-weight: 700; }
        .edit-menu { list-style: none; padding: 0; }
        .edit-menu li { display: flex; align-items: center; gap: 10px; padding: 11px 14px; border-radius: 8px; margin-bottom: 6px; cursor: pointer; color: #555; font-size: 14px; font-weight: 500; transition: 0.2s; }
        .edit-menu li:hover { background: #e8f0fe; color: #1e3c72; }
        .edit-menu .active { background: #2d7dd2; color: white; }

        /* MAIN */
        .edit-main { flex: 1; display: flex; flex-direction: column; }

        /* TOPBAR */
        .edit-topbar { height: 70px; background: #fff; display: flex; justify-content: space-between; align-items: center; padding: 0 30px; border-bottom: 1px solid #e0e0e0; }
        .edit-search-box { display: flex; align-items: center; gap: 10px; background: white; border: 1px solid #e0e0e0; border-radius: 10px; padding: 10px 16px; width: 500px; }
        .edit-search-box input { flex: 1; border: none; outline: none; font-size: 14px; background: transparent; }
        .edit-topbar-right { display: flex; align-items: center; gap: 14px; }
        .edit-topbar-icons { display: flex; gap: 10px; font-size: 20px; }
        .topbar-logout-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #fff5f5; border: 1px solid #ffcdd2; border-radius: 8px; color: #e53935; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s; font-family: "Poppins", sans-serif; }
        .topbar-logout-btn:hover { background: #ffeaea; }

        /* CONTENT */
        .edit-content { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 40px 30px; }
        .edit-page-title { margin-bottom: 25px; align-self: flex-start; }
        .edit-page-title h2 { font-size: 26px; color: #222; font-weight: 700; }

        /* CARD */
        .edit-card { background: white; border-radius: 20px; padding: 35px; width: 100%; max-width: 650px; border: 1px solid #e0e0e0; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }

        /* AVATAR */
        .edit-avatar-area { display: flex; flex-direction: column; align-items: center; margin-bottom: 30px; }
        .edit-avatar { width: 100px; height: 100px; background: linear-gradient(135deg, #2d7dd2, #5aa9ff); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 42px; color: white; margin-bottom: 10px; }
        .edit-avatar-name { font-size: 16px; font-weight: 600; color: #222; }

        /* SECTION */
        .edit-section-title { font-size: 13px; font-weight: 600; color: #2d7dd2; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; margin-top: 10px; }

        /* FORM */
        .edit-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .edit-field label { font-size: 13px; color: #888; font-weight: 500; }
        .edit-field input,
        .edit-field select { padding: 11px 14px; border: 1px solid #e0e0e0; border-radius: 10px; font-size: 14px; font-family: "Poppins", sans-serif; color: #222; outline: none; transition: 0.2s; background: #f9fbff; }
        .edit-field input:focus,
        .edit-field select:focus { border-color: #2d7dd2; background: white; }
        .edit-field input:disabled { background: #f0f0f0; color: #aaa; cursor: not-allowed; }

        /* BUTTONS */
        .edit-btn-row { display: flex; gap: 12px; margin-top: 24px; }
        .edit-save-btn { flex: 1; padding: 14px; background: #2d7dd2; border: none; border-radius: 12px; color: white; font-size: 15px; font-weight: 600; cursor: pointer; transition: 0.2s; font-family: "Poppins", sans-serif; }
        .edit-save-btn:hover { background: #1a5fa8; }
        .edit-save-btn:disabled { background: #a0c4e8; cursor: not-allowed; }
        .edit-cancel-btn { flex: 1; padding: 14px; background: #f5f7fa; border: 1px solid #e0e0e0; border-radius: 12px; color: #555; font-size: 15px; font-weight: 600; cursor: pointer; transition: 0.2s; font-family: "Poppins", sans-serif; }
        .edit-cancel-btn:hover { background: #e8f0fe; color: #1e3c72; }

        /* LOADING */
        .edit-loading { display: flex; align-items: center; justify-content: center; height: 200px; font-size: 16px; color: #888; }
      `}</style>

      <div className="edit-page">

        {/* SIDEBAR */}
        <div className="edit-sidebar">
          <div className="edit-logo-area">
            <img src={logo} alt="logo" />
            <h2>TaskFlow</h2>
          </div>
          <ul className="edit-menu">
            <li onClick={() => navigate("/dashboard")}>🏠 Dashboard</li>
            <li onClick={() => navigate("/tugas")}>📋 Tugas</li>
            <li onClick={() => navigate("/kelompok")}>👥 Kelompok</li>
            <li className="active">👤 Profil</li>
            <li onClick={() => navigate("/riwayat")}>⏱️ Riwayat</li>
          </ul>
        </div>

        {/* MAIN */}
        <div className="edit-main">

          {/* TOPBAR */}
          <div className="edit-topbar">
            <div className="edit-search-box">
              🔍 <input type="text" placeholder="Cari..." />
            </div>
            <div className="edit-topbar-right">
              <div className="edit-topbar-icons">
                <span>🔔</span>
                <span>ℹ️</span>
              </div>
              <button
                className="topbar-logout-btn"
                onClick={() => { localStorage.removeItem("token"); navigate("/"); }}
              >
                🚪 Logout
              </button>
            </div>
          </div>

          {/* CONTENT */}
          <div className="edit-content">

            <div className="edit-page-title">
              <h2>Edit Profil</h2>
            </div>

            {loading ? (
              <div className="edit-loading">Memuat data...</div>
            ) : (
              <div className="edit-card">

                {/* AVATAR */}
                <div className="edit-avatar-area">
                  <div className="edit-avatar">👤</div>
                  <div className="edit-avatar-name">{form.name}</div>
                </div>

                {/* INFORMASI UTAMA */}
                <div className="edit-section-title">Informasi Utama</div>

                <div className="edit-field">
                  <label>Nama Lengkap</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div className="edit-field">
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Masukkan username"
                  />
                </div>

                <div className="edit-field">
                  <label>Email (tidak dapat diubah)</label>
                  <input
                    type="email"
                    value={form.email}
                    disabled
                  />
                </div>

                {/* INFORMASI DETAIL */}
                <div className="edit-section-title" style={{ marginTop: 20 }}>Informasi Detail</div>

                <div className="edit-field">
                  <label>No. Telepon</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Masukkan no. telepon"
                  />
                </div>

                <div className="edit-field">
                  <label>Alamat</label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Masukkan alamat"
                  />
                </div>

                <div className="edit-field">
                  <label>Tanggal Lahir</label>
                  <input
                    type="date"
                    name="birthdate"
                    value={form.birthdate}
                    onChange={handleChange}
                  />
                </div>

                <div className="edit-field">
                  <label>Jenis Kelamin</label>
                  <select name="gender" value={form.gender} onChange={handleChange}>
                    <option value="">-- Pilih --</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                {/* TOMBOL */}
                <div className="edit-btn-row">
                  <button className="edit-cancel-btn" onClick={() => navigate("/profil")}>
                    Batal
                  </button>
                  <button className="edit-save-btn" onClick={handleSave} disabled={saving}>
                    {saving ? "Menyimpan..." : "💾 Simpan"}
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

export default EditProfil;
