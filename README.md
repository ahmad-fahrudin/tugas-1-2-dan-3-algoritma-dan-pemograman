# Tugas 3: Perhitungan Penghasilan Karyawan (Operator, IF, dan Array)

Aplikasi web interaktif untuk menghitung penghasilan bulanan karyawan berdasarkan **golongan** dan **jumlah jam lembur**. Proyek ini dibuat untuk memenuhi **Tugas 3 Algoritma dan Pemrograman** menggunakan bahasa **Java** sebagai backend web server, serta antarmuka modern yang dilengkapi **visualisasi 3D workstation interaktif (Three.js)**.

Program mengimplementasikan konsep:
1. **Array** untuk penyimpanan data tarif gaji dan persentase lembur.
2. **Struktur Kontrol IF** untuk penentuan indeks array berdasarkan input.
3. **Operator Aritmatika** (`*` dan `+`) untuk kalkulasi gaji lembur dan total penghasilan.

---

## Ketentuan Kasus Tugas 3

### 1. Array Gaji Pokok
Gaji setiap golongan disimpan pada **Array Gaji** (`ARRAY_GAJI`):
- Input Golongan **"A"** &rarr; Mengambil gaji pada **Array indeks 0** (Rp 5.000.000)
- Input Golongan **"B"** &rarr; Mengambil gaji pada **Array indeks 1** (Rp 6.500.000)
- Input Golongan **"C"** &rarr; Mengambil gaji pada **Array indeks 2** (Rp 9.500.000)

### 2. Array Persen Lembur
Persentase lembur disimpan pada **Array Lembur** (`ARRAY_LEMBUR`): `[0.30, 0.32, 0.34, 0.36, 0.38]` (30%, 32%, 34%, 36%, 38%):
- Lembur **1 Jam** &rarr; 30% dari Gaji Pokok (**Array lembur indeks 0**)
- Lembur **2 Jam** &rarr; 32% dari Gaji Pokok (**Array lembur indeks 1**)
- Lembur **3 Jam** &rarr; 34% dari Gaji Pokok (**Array lembur indeks 2**)
- Lembur **4 Jam** &rarr; 36% dari Gaji Pokok (**Array lembur indeks 3**)
- Lembur **&ge; 5 Jam** &rarr; 38% dari Gaji Pokok (**Array lembur indeks 4**)
- Lembur **0 Jam** &rarr; 0% (tidak ada lembur)

### 3. Rumus Perhitungan (Operator)
- **Gaji Lembur**: `persenLembur * gajiPokok`
- **Total Penghasilan**: `gajiPokok + gajiLembur`

---

## Persyaratan
- Java Development Kit (JDK) 11 atau lebih baru.
- Web Browser modern (Chrome, Firefox, Edge, Safari, dll.).

---

## Cara Menjalankan

1. Buka terminal di folder proyek ini.
2. Jalankan web server Java:
   ```bash
   java WebServer.java
   ```
3. Buka browser dan akses alamat berikut:
   ```text
   http://localhost:8080
   ```
4. **Kontrol Simulasi 3D Interaktif:**
   - **Klik Layar:** Mengunci kursor mouse untuk mode bermain.
   - **`W`, `A`, `S`, `D`:** Berjalan menjelajahi ruangan kantor.
   - **Gerakan Mouse:** Mengarahkan pandangan kamera (FPS / 3rd Person).
   - **`Shift`:** Berlari cepat (*Sprint*).
   - **`Spasi`:** Melompat (*Jump*).
   - **`Tab` / `V`:** Berganti sudut pandang kamera (*First-Person* / *Third-Person*).
   - **`E`:** Mendekati kursi kerja dan tekan **E** untuk duduk serta membuka terminal kalkulasi gaji.
   - **`ESC`:** Berdiri dari kursi dan melepaskan kursor mouse untuk kembali menjelajah.
5. Untuk menghentikan server, tekan `Ctrl + C` pada terminal.

---

## Struktur File

```text
.
├── WebServer.java       # HTTP Web Server & logika backend Tugas 3 (Operator, IF, Array)
├── index.html           # Antarmuka web (form input, panel 3D, dan tabel hasil)
├── style.css            # Desain tata letak visual modern & HUD 3D
├── js/
│   ├── payroll3d.js     # Entry point & orchestrator utama simulasi 3D
│   ├── three.min.js     # Library Three.js (offline bundle, zero npm dependency)
│   ├── OrbitControls.js # Kontrol interaktif kamera 3D
│   └── component/       # Clean Architecture Components:
│       ├── OfficeRoom.js   # Arsitektur ruangan 3D (lantai, dinding slat, jendela)
│       ├── Workstation.js  # Meja kerja, kursi ergonomis, monitor & terminal
│       ├── Player.js       # Karakter player 3D, kontrol WASD & fisika gerak
│       ├── NpcEmployee.js  # Karakter NPC karyawan & interaksi serahkan gaji
│       ├── MoneyAndSlip.js # Gepokan uang rupiah, slip hologram & partikel
│       └── SoundFX.js      # Synthesizer audio prosedural Web Audio API
└── README.md            # Dokumentasi proyek Tugas 3
```

---

## Endpoint API

Server menyediakan endpoint REST sederhana:

```text
GET /hitung?golongan=B&jam=2
```

Contoh respons berhasil (`200 OK`):
```json
{
  "golongan": "B",
  "gajiPokok": 6500000,
  "jamLembur": 2,
  "persenLembur": 32,
  "gajiLembur": 2080000,
  "totalPenghasilan": 8580000
}
```

Jika parameter tidak sesuai, server mengembalikan status `400 Bad Request` dengan pesan error dalam format JSON.

---

## Lisensi
Proyek ini dibuat untuk keperluan pembelajaran dan tugas akademik mata kuliah Algoritma dan Pemrograman.
