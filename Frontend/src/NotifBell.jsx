import { useState, useEffect, useRef } from "react";

function NotifBell() {
  const [tasks, setTasks] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    fetch(`http://localhost:3001/api/tasks?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => setTasks(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Gagal ambil tugas notif:", err));
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

  const getSisaHari = (deadline) => {
    if (!deadline) return null;
    const diff = new Date(deadline) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const notifTasks = tasks
    .filter((t) => {
      if (t.status === "Selesai") return false;
      const sisa = getSisaHari(t.deadline);
      return sisa !== null && sisa >= 0 && sisa <= 7;
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const getNotifColor = (sisa) => {
    if (sisa <= 1) return "#e53935";
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

  return (
    <>
      <style>{`
        .notif-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
        }
        .notif-bell {
          position: relative;
          cursor: pointer;
          font-size: 20px;
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .notif-badge {
          position: absolute;
          top: -6px;
          right: -8px;
          background: #e53935;
          color: white;
          font-size: 10px;
          font-weight: 700;
          border-radius: 50%;
          width: 17px;
          height: 17px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .notif-dropdown {
          position: absolute;
          top: 40px;
          right: 0;
          width: 320px;
          background: white;
          border-radius: 14px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
          border: 1px solid #e0e0e0;
          z-index: 9999;
          overflow: hidden;
          animation: fadeDown 0.2s ease;
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .notif-header {
          padding: 14px 16px;
          font-size: 14px;
          font-weight: 700;
          color: #1e3c72;
          border-bottom: 1px solid #f0f0f0;
          background: #f5f7fa;
        }
        .notif-empty {
          padding: 24px 16px;
          text-align: center;
          color: #888;
          font-size: 14px;
        }
        .notif-item {
          padding: 12px 16px;
          border-bottom: 1px solid #f5f5f5;
          transition: background 0.2s;
        }
        .notif-item:hover { background: #f9fbff; }
        .notif-item:last-child { border-bottom: none; }
        .notif-item-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
          gap: 8px;
        }
        .notif-title {
          font-size: 14px;
          font-weight: 600;
          color: #222;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .notif-sisa {
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }
        .notif-item-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .notif-matkul { font-size: 12px; color: #888; }
        .notif-deadline { font-size: 12px; color: #aaa; }
      `}</style>

      <div className="notif-wrapper" ref={notifRef}>
        <div className="notif-bell" onClick={() => setShowNotif(!showNotif)}>
          🔔
          {notifTasks.length > 0 && (
            <span className="notif-badge">{notifTasks.length}</span>
          )}
        </div>

        {showNotif && (
          <div className="notif-dropdown">
            <div className="notif-header">🔔 Notifikasi Deadline</div>

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
    </>
  );
}

export default NotifBell;