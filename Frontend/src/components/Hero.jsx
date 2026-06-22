import gambar from "../assets/gambar.png";

function Hero() {
  return (
    <div className="hero">
      <div className="text">
        <h1>
          Selamat Datang di <br />
          Sistem Manajemen <span>Tugas Mahasiswa</span>
        </h1>

        <button>klik disini untuk lanjutkan →</button>
      </div>

      <div className="image">
        <img src={gambar} alt="hero" />
      </div>
    </div>
  );
}

export default Hero;