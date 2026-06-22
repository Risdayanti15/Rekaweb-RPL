import React from "react";
import "./modalTugas.css";

function ModalTugas({ onClose, onSimpan, editData }) {
  const [form, setForm] = React.useState({
    namaTugas: "",
    mataKuliah: "",
    deskripsi: "",
    deadline: "",
    status: "",
  });

  // Isi form otomatis saat edit
  React.useEffect(() => {
    if (editData) {
      setForm({
        namaTugas: editData.title || "",
        mataKuliah: editData.type || "",
        deskripsi: editData.description || "",
        deadline: editData.deadline ? editData.deadline.split("T")[0] : "",
        status: editData.status || "",
      });
    } else {
      setForm({
        namaTugas: "",
        mataKuliah: "",
        deskripsi: "",
        deadline: "",
        status: "",
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSimpan = () => {
    if (!form.namaTugas || !form.status) {
      alert("Nama tugas dan status wajib diisi!");
      return;
    }
    onSimpan(form);
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3>{editData ? "Edit Tugas" : "Daftar Tugas"}</h3>
          <span className="close" onClick={onClose}>X</span>
        </div>

        {/* Form */}
        <div className="modal-body">
          <label>Nama Tugas</label>
          <input
            type="text"
            name="namaTugas"
            value={form.namaTugas}
            onChange={handleChange}
          />

          <label>Mata Kuliah</label>
          <select name="mataKuliah" value={form.mataKuliah} onChange={handleChange}>
            <option value="">-- Pilih --</option>
            <option value="Pemrograman">Pemrograman</option>
            <option value="Basis Data">Basis Data</option>
          </select>

          <label>Deskripsi</label>
          <textarea
            rows="3"
            name="deskripsi"
            value={form.deskripsi}
            onChange={handleChange}
          ></textarea>

          <div className="row">
            <div className="deadline">
              <label>Deadline</label>
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
              />
            </div>
            <div className="status">
              <label>Status</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="Belum"
                    checked={form.status === "Belum"}
                    onChange={handleChange}
                  /> Belum
                </label>
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="Proses"
                    checked={form.status === "Proses"}
                    onChange={handleChange}
                  /> Proses
                </label>
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="Selesai"
                    checked={form.status === "Selesai"}
                    onChange={handleChange}
                  /> Selesai
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-batal" onClick={onClose}>Batal</button>
          <button className="btn-simpan" onClick={handleSimpan}>Simpan</button>
        </div>
      </div>
    </div>
  );
}

export default ModalTugas;