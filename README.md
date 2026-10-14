# Perhitungan Penghasilan Karyawan

Aplikasi web sederhana untuk menghitung penghasilan bulanan karyawan berdasarkan **golongan** dan **jumlah jam lembur**. Proyek ini dibuat sebagai tugas Algoritma dan Pemrograman menggunakan Java sebagai web server, serta HTML, CSS, dan JavaScript sebagai antarmuka pengguna.

## Fitur

- Memilih golongan karyawan A, B, atau C.
- Memasukkan jumlah jam lembur.
- Menghitung gaji pokok, persentase lembur, nominal lembur, dan total penghasilan.
- Menampilkan hasil perhitungan melalui halaman web.
- Menyediakan validasi input pada server Java.
- Menyertakan pseudocode dan flowchart algoritma.

## Ketentuan Perhitungan

| Golongan | Gaji Pokok |
|:---:|---:|
| A | Rp5.000.000 |
| B | Rp6.500.000 |
| C | Rp9.500.000 |

Persentase uang lembur ditentukan sebagai berikut:

| Jam Lembur | Persentase |
|:---:|---:|
| 0 jam | 0% |
| 1 jam | 30% |
| 2 jam | 32% |
| 3 jam | 34% |
| 4 jam | 36% |
| 5 jam atau lebih | 38% |

Rumus yang digunakan:

```text
Gaji Lembur = Persentase Lembur × Gaji Pokok
Total Penghasilan = Gaji Pokok + Gaji Lembur
```

## Persyaratan

- Java Development Kit (JDK) 11 atau lebih baru.
- Browser web modern seperti Chrome, Firefox, atau Microsoft Edge.
- Terminal atau command prompt.

Aplikasi menggunakan `com.sun.net.httpserver.HttpServer` yang tersedia pada JDK. Tidak diperlukan framework atau dependensi tambahan.

## Cara Menjalankan

1. Buka terminal dan masuk ke folder proyek:

   ```bash
   cd "/home/fahrudin/Projects/Tugas 1, 2 dan 3 - Algoritma dan Pemograman"
   ```

   Jika proyek sudah diunduh dari GitHub, gunakan lokasi folder hasil clone.

2. Kompilasi program Java:

   ```bash
   javac WebServer.java
   ```

3. Jalankan server:

   ```bash
   java WebServer
   ```

4. Buka alamat berikut pada browser:

   <http://localhost:8080>

5. Pilih golongan, masukkan jumlah jam lembur, lalu tekan **Hitung Penghasilan**.

Untuk menghentikan server, tekan `Ctrl+C` pada terminal.

> Jalankan perintah `java WebServer` dari folder yang sama dengan `index.html` dan `style.css`, karena server membaca kedua file tersebut dari direktori kerja saat ini.

## Struktur Folder

```text
.
├── WebServer.java
├── index.html
├── style.css
└── flowchart_pseudocode/
    ├── flowchart_gaji_karyawan.drawio
    └── pseudocode_gaji_karyawan.md
```

### Penjelasan File

- `WebServer.java` — server HTTP sederhana, endpoint perhitungan, validasi, dan logika algoritma.
- `index.html` — tampilan form dan JavaScript untuk mengirim input serta menampilkan hasil.
- `style.css` — gaya visual halaman web.
- `flowchart_pseudocode/pseudocode_gaji_karyawan.md` — pseudocode dan tabel pengujian algoritma.
- `flowchart_pseudocode/flowchart_gaji_karyawan.drawio` — flowchart yang dapat dibuka menggunakan [diagrams.net](https://app.diagrams.net/).

## Endpoint API

Server menyediakan endpoint berikut:

```text
GET /hitung?golongan=A&jam=2
```

Contoh respons berhasil:

```json
{
  "golongan": "A",
  "gajiPokok": 5000000,
  "jamLembur": 2,
  "persenLembur": 32,
  "gajiLembur": 1600000,
  "totalPenghasilan": 6600000
}
```

Jika input tidak valid, server mengembalikan respons HTTP `400` dengan pesan kesalahan dalam format JSON.

## Contoh Pengujian

Input:

- Golongan: `B`
- Jam lembur: `2`

Hasil:

- Gaji pokok: Rp6.500.000
- Persentase lembur: 32%
- Gaji lembur: Rp2.080.000
- Total penghasilan: Rp8.580.000

## Lisensi

Proyek ini dibuat untuk keperluan pembelajaran dan tugas akademik.
