import React, { useState, useEffect, useRef } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import logo from "./assets/logo.png";
import blueImg from "./assets/blue.png";
import yellowImg from "./assets/yellow.png";
import greenImg from "./assets/green.png";
import redImg from "./assets/red.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);
  const [modalType, setModalType] = useState(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // STATE kalender interaktif
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) { navigate("/"); return; }
    setUser(storedUser);
    fetch(`https://rekaweb-rpl-production.up.railway.app/api/tasks?userId=${storedUser.id}`)
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error("Gagal ambil tugas:", err));
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

  const handleLogout = () => setShowLogoutConfirm(true);

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleCancelLogout = () => setShowLogoutConfirm(false);

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

  const formatDeadline = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

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

  const totalTugas = tasks.length;
  const tugasSelesai = tasks.filter((t) => t.status === "Selesai").length;
  const tugasBelum = tasks.filter((t) => t.status === "Belum").length;
  const deadlineDekat = tasks.filter((t) => {
    if (!t.deadline) return false;
    const diff = new Date(t.deadline) - new Date();
    return diff > 0 && diff <= 3 * 24 * 60 * 60 * 1000;
  }).length;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = now.getDate();

  const deadlineMap = {};
  tasks.forEach((task) => {
    if (!task.deadline) return;
    const d = new Date(task.deadline);
    if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
      const day = d.getDate();
      if (!deadlineMap[day]) deadlineMap[day] = [];
      deadlineMap[day].push({ title: task.title, status: task.status });
    }
  });

  const getLabelColor = (status) => {
    if (status === "Selesai") return "#4caf50";
    if (status === "Proses") return "#f7931e";
    return "#e53935";
  };

  // HANDLER klik hari di kalender (toggle)
  const handleCalendarDayClick = (day) => {
    setSelectedCalendarDay((prev) => (prev === day ? null : day));
  };

  // MODAL LOGIC
  const getModalTasks = () => {
    if (modalType === "total") return tasks;
    if (modalType === "selesai") return tasks.filter((t) => t.status === "Selesai");
    if (modalType === "belum") return tasks.filter((t) => t.status === "Belum");
    if (modalType === "deadline") return tasks.filter((t) => {
      if (!t.deadline) return false;
      const diff = new Date(t.deadline) - new Date();
      return diff > 0 && diff <= 3 * 24 * 60 * 60 * 1000;
    });
    return [];
  };

  const getModalTitle = () => {
    if (modalType === "total") return "Total Tugas";
    if (modalType === "selesai") return "Total Selesai";
    if (modalType === "belum") return "Total Belum";
    if (modalType === "deadline") return "Deadline";
    return "";
  };

  const getModalTheme = () => {
    if (modalType === "total") return "modal-theme-blue";
    if (modalType === "selesai") return "modal-theme-yellow";
    if (modalType === "belum") return "modal-theme-green";
    if (modalType === "deadline") return "modal-theme-red";
    return "";
  };

  const getModalBg = () => {
    if (modalType === "total") return blueImg;
    if (modalType === "selesai") return yellowImg;
    if (modalType === "belum") return greenImg;
    if (modalType === "deadline") return redImg;
    return "";
  };

  const getModalStatusLabel = (task) => {
    if (modalType === "selesai") return <span className="modal-status selesai">Selesai</span>;
    if (modalType === "belum") return <span className="modal-status belum-selesai">Belum Selesai</span>;
    if (modalType === "deadline") return <span className="modal-status deadline-label">Deadline</span>;
    return null;
  };

  const groupTasksByType = (taskList) => {
    const groups = {};
    taskList.forEach((task) => {
      const key = task.type || "Umum";
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    });
    return groups;
  };

  const getGroupIcon = (type) => {
    const icons = {
      "Data Maining": "📋",
      "Sistem Tertanam": "🔧",
      "Rekayasa Web": "💻",
    };
    return icons[type] || "📁";
  };

  const handleToggleEditMode = () => {
    setIsEditMode((prev) => !prev);
    setSelectedTaskIds([]);
  };

  const handleSelectTask = (taskId) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedTaskIds.length === 0) {
      alert("Pilih tugas yang ingin dihapus terlebih dahulu.");
      return;
    }
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      await Promise.all(
        selectedTaskIds.map((id) =>
          fetch(`http://localhost:3001/api/tasks/${id}`, { method: "DELETE" })
        )
      );
      setTasks((prev) => prev.filter((t) => !selectedTaskIds.includes(t.id)));
      setSelectedTaskIds([]);
      setIsEditMode(false);
    } catch (err) {
      console.error("Gagal hapus tugas:", err);
      alert("Gagal menghapus tugas. Coba lagi.");
    }
  };

  const handleCancelDelete = () => setShowDeleteConfirm(false);

  const handleCloseModal = () => {
    setModalType(null);
    setIsEditMode(false);
    setSelectedTaskIds([]);
  };

  const modalTasks = getModalTasks();
  const groupedTasks = groupTasksByType(modalTasks);

  return (
    <div className="dashboard">

      {/* SIDEBAR - hanya tampil di desktop */}
      <div className="sidebar">
        <div className="logo-area">
          <img src={logo} alt="logo" />
          <h2>TaskFlow</h2>
        </div>
        <ul className="menu">
  <li className="active" onClick={() => navigate("/dashboard")}>
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
  <li onClick={() => navigate("/profil")}>
    <span className="menu-icon">👤</span> Profil
  </li>
</ul>
      </div>

      {/* MAIN */}
      <div className="main" style={{ position: "relative" }}>

        {/* HEADER */}
        <div className="header">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Cari tugas..." />
          </div>
          <div className="icons">
            <div className="notif-wrapper" ref={notifRef}>
              <div className="notif-bell" onClick={() => setShowNotif(!showNotif)}>
                🔔
                {notifTasks.length > 0 && (
                  <span className="notif-badge">{notifTasks.length}</span>
                )}
              </div>
              {showNotif && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <span>🔔 Notifikasi Deadline</span>
                  </div>
                  {notifTasks.length === 0 ? (
                    <div className="notif-empty">Tidak ada deadline mendekat 🎉</div>
                  ) : (
                    notifTasks.map((task) => {
                      const sisa = getSisaHari(task.deadline);
                      return (
                        <div className="notif-item" key={task.id}>
                          <div className="notif-item-top">
                            <span className="notif-title">{task.title}</span>
                            <span className="notif-sisa" style={{ color: getNotifColor(sisa) }}>
                              {getNotifLabel(sisa)}
                            </span>
                          </div>
                          <div className="notif-item-bottom">
                            <span className="notif-matkul">{task.type}</span>
                            <span className="notif-deadline">📅 {formatDeadline(task.deadline)}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="content">
          <h2>Selamat datang, <b>{user ? user.name : "..."}</b> 👋</h2>

          {/* CARDS */}
          <div className="cards">
            <div
              className="card card-clickable"
              style={{ backgroundImage: `url(${blueImg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
              onClick={() => setModalType("total")}
            >
              <p>Total Tugas</p>
              <h3>{totalTugas}</h3>
            </div>
            <div
              className="card card-clickable"
              style={{ backgroundImage: `url(${yellowImg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
              onClick={() => setModalType("selesai")}
            >
              <p>Tugas Selesai</p>
              <h3>{tugasSelesai}</h3>
            </div>
            <div
              className="card card-clickable"
              style={{ backgroundImage: `url(${greenImg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
              onClick={() => setModalType("belum")}
            >
              <p>Tugas Belum</p>
              <h3>{tugasBelum}</h3>
            </div>
            <div
              className="card card-clickable"
              style={{ backgroundImage: `url(${redImg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
              onClick={() => setModalType("deadline")}
            >
              <p>Deadline dekat</p>
              <h3>{deadlineDekat}</h3>
            </div>
          </div>

          {/* BOTTOM SECTION */}
          <div className="bottom">
            <div className="tasks">
              <h3>Today's Tasks</h3>
              {tasks.length === 0 ? (
                <p style={{ padding: "20px", color: "#888" }}>Belum ada tugas.</p>
              ) : (
                tasks.map((task) => (
                  <div className="task-item" key={task.id}>
                    <div className="task-left">
                      <p>{task.title}</p>
                      <span>Deadline: {formatDeadline(task.deadline)}</span>
                    </div>
                    <div className="task-right">
                      <button className={`status ${getStatusClass(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* KALENDER INTERAKTIF */}
            <div className="calendar">
              <h3>Kalender</h3>
              <div className="calendar-box">
                <div className="calendar-header">
                  <span>{now.toLocaleString("id-ID", { month: "long" })}</span>
                  <span>{currentYear}</span>
                </div>
                <div className="dates">
                  {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1;
                    const isToday = day === today;
                    const isSelected = selectedCalendarDay === day;
                    const deadlineTasks = deadlineMap[day] || [];
                    const hasTask = deadlineTasks.length > 0;
                    return (
                      <div
                        key={i}
                        className={`date-cell ${isToday ? "today" : ""} ${isSelected ? "selected-day" : ""} ${hasTask ? "has-task" : ""}`}
                        onClick={() => handleCalendarDayClick(day)}
                        style={{ cursor: "pointer" }}
                      >
                        <span className="date-number">{day}</span>
                        {deadlineTasks.map((task, idx) => (
                          <span
                            key={idx}
                            className="deadline-label"
                            style={{ color: getLabelColor(task.status) }}
                          >
                            {task.title}
                          </span>
                        ))}
                      </div>
                    );
                  })}
                </div>

                {/* PANEL DETAIL HARI YANG DIPILIH */}
                {selectedCalendarDay && (
                  <div className="calendar-day-detail">
                    <div className="calendar-day-detail-header">
                      <span>
                        📅 {selectedCalendarDay}{" "}
                        {now.toLocaleString("id-ID", { month: "long" })} {currentYear}
                      </span>
                      <button
                        className="calendar-day-close"
                        onClick={() => setSelectedCalendarDay(null)}
                      >
                        ✕
                      </button>
                    </div>
                    {(deadlineMap[selectedCalendarDay] || []).length === 0 ? (
                      <p className="calendar-day-empty">Tidak ada tugas di hari ini 🎉</p>
                    ) : (
                      (deadlineMap[selectedCalendarDay] || []).map((task, idx) => (
                        <div key={idx} className="calendar-day-task">
                          <span
                            className="calendar-day-dot"
                            style={{ background: getLabelColor(task.status) }}
                          />
                          <span className="calendar-day-title">{task.title}</span>
                          <span
                            className="calendar-day-status"
                            style={{ color: getLabelColor(task.status) }}
                          >
                            {task.status === "Selesai"
                              ? "✅ Selesai"
                              : task.status === "Proses"
                              ? "🔄 Proses"
                              : "⏳ Belum"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MODAL UTAMA */}
        {modalType && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div
              className={`modal-container ${getModalTheme()}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-title-row">
                  <span className="modal-icon">📋</span>
                  <h2 className="modal-title">{getModalTitle()}</h2>
                </div>
                <div className="modal-header-actions">
                  <button
                    className={`modal-btn-edit ${isEditMode ? "active" : ""}`}
                    onClick={handleToggleEditMode}
                  >
                    {isEditMode ? "✕ Batal" : "✏️ Edit"}
                  </button>
                  <button
                    className="modal-btn-delete"
                    onClick={handleDeleteSelected}
                    title={
                      !isEditMode
                        ? "Klik Edit dulu untuk memilih tugas"
                        : selectedTaskIds.length === 0
                        ? "Pilih tugas dulu"
                        : `Hapus ${selectedTaskIds.length} tugas`
                    }
                    style={{
                      opacity: isEditMode && selectedTaskIds.length > 0 ? 1 : 0.35,
                      cursor: isEditMode && selectedTaskIds.length > 0 ? "pointer" : "not-allowed",
                    }}
                  >
                    🗑️
                    {isEditMode && selectedTaskIds.length > 0 && (
                      <span className="delete-badge">{selectedTaskIds.length}</span>
                    )}
                  </button>
                </div>
              </div>

              {isEditMode && (
                <div className="modal-edit-bar">
                  <span>✅ Pilih tugas yang ingin dihapus</span>
                  <span className="modal-edit-count">{selectedTaskIds.length} dipilih</span>
                </div>
              )}

              <div
                className="modal-body"
                style={{
                  backgroundImage: `url(${getModalBg()})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                {modalTasks.length === 0 ? (
                  <div className="modal-empty">
                    <p>Tidak ada tugas dalam kategori ini.</p>
                  </div>
                ) : (
                  Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
                    <div key={groupName} className="modal-group">
                      <div className="modal-group-header">
                        <span className="modal-group-icon">{getGroupIcon(groupName)}</span>
                        <span className="modal-group-name">{groupName}</span>
                      </div>
                      {groupTasks.map((task) => {
                        const isSelected = selectedTaskIds.includes(task.id);
                        return (
                          <div
                            key={task.id}
                            className={`modal-task-item ${isEditMode ? "edit-mode" : ""} ${isSelected ? "selected" : ""}`}
                            onClick={() => isEditMode && handleSelectTask(task.id)}
                          >
                            {isEditMode ? (
                              <div className={`modal-radio ${isSelected ? "checked" : ""}`}>
                                {isSelected && <div className="modal-radio-inner" />}
                              </div>
                            ) : (
                              (modalType === "belum" || modalType === "deadline" || modalType === "selesai") && (
                                <div className="modal-task-dot"></div>
                              )
                            )}
                            <div className="modal-task-info">
                              <p className="modal-task-title">{task.title}</p>
                              <span className="modal-task-deadline">
                                Deadline: {formatDeadline(task.deadline)}
                              </span>
                              {task.note && (
                                <span className="modal-task-note">{task.note}</span>
                              )}
                            </div>
                            {!isEditMode && getModalStatusLabel(task)}
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              <div className="modal-footer">
                {isEditMode && selectedTaskIds.length > 0 && (
                  <button className="modal-btn-hapus-confirm" onClick={handleDeleteSelected}>
                    🗑️ Hapus {selectedTaskIds.length} Tugas
                  </button>
                )}
                <button className="modal-btn-kembali" onClick={handleCloseModal}>
                  Kembali
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL KONFIRMASI HAPUS */}
        {showDeleteConfirm && (
          <div className="confirm-overlay" onClick={handleCancelDelete}>
            <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
              <div className="confirm-icon">🗑️</div>
              <h3 className="confirm-title">Hapus Tugas</h3>
              <p className="confirm-message">
                Apakah Anda yakin ingin menghapus{" "}
                <strong>{selectedTaskIds.length} tugas</strong> yang dipilih?
                <br />
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="confirm-actions">
                <button className="confirm-btn-no" onClick={handleCancelDelete}>Tidak</button>
                <button className="confirm-btn-yes" onClick={handleConfirmDelete}>Ya, Hapus</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL KONFIRMASI LOGOUT */}
        {showLogoutConfirm && (
          <div className="confirm-overlay" onClick={handleCancelLogout}>
            <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
              <div className="confirm-icon">⚠️</div>
              <h3 className="confirm-title">Yakin Ingin Keluar?</h3>
              <p className="confirm-message">
                Kamu akan keluar dari sesi TaskFlow ini.
              </p>
              <div className="confirm-actions">
                <button className="confirm-btn-no" onClick={handleCancelLogout}>Tidak</button>
                <button className="confirm-btn-yes" onClick={handleConfirmLogout}>Ya, Keluar</button>
              </div>
            </div>
          </div>
        )}

      </div>{/* end .main */}

      {/* ✅ BOTTOM NAVIGATION - hanya tampil di HP */}
      <div className="bottom-nav">
  <button className="bottom-nav-item active" onClick={() => navigate("/dashboard")}>
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
  <button className="bottom-nav-item" onClick={() => navigate("/profil")}>
    <span className="bottom-nav-icon">👤</span>
    <span className="bottom-nav-label">Profil</span>
  </button>
</div>

    </div>
  );
};

export default Dashboard;