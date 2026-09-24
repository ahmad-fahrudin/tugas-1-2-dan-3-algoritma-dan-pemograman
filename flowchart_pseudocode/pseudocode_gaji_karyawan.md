# Pseudocode Perhitungan Penghasilan Karyawan

```text
================================================================================
I. JUDUL
================================================================================
Kelas HitungPenghasilanKaryawan
// Program untuk menghitung total penghasilan karyawan yang terdiri dari
// Gaji Pokok (berdasarkan Golongan) dan Gaji Lembur (berdasarkan Jam Lembur).

================================================================================
II. DESKRIPSI (DEKLARASI)
================================================================================
// Deklarasi Variabel dan Tipe Data:
char golongan
int jamLembur
float gajiPokok, persenLembur, gajiLembur, totalPenghasilan

================================================================================
III. IMPLEMENTASI (INTI DARI ALGORITMA)
================================================================================
1  Mulai
2  // Inisialisasi nilai awal variabel:
3  gajiPokok <- 0
4  persenLembur <- 0.0
5  gajiLembur <- 0.0
6  totalPenghasilan <- 0.0
7  // Masukan data (Input):
8  Cetak "Masukkan Golongan Karyawan (A/B/C): "
9  Input golongan
10 Cetak "Masukkan Jumlah Jam Lembur: "
11 Input jamLembur
12 // Tahap 1: Seleksi Golongan untuk Menentukan Gaji Pokok
13 if (golongan = 'A' OR golongan = 'a') then
    13.1 gajiPokok <- 5000000
14 else if (golongan = 'B' OR golongan = 'b') then
    14.1 gajiPokok <- 6500000
15 else if (golongan = 'C' OR golongan = 'c') then
    15.1 gajiPokok <- 9500000
16 else
    16.1 Cetak "Error: Golongan tidak valid! Masukkan hanya golongan A, B, atau C."
    16.2 pergi ke 39 // Lompat langsung ke langkah Selesai
17 end-if
18 // Tahap 2: Seleksi Jam Lembur untuk Menentukan Persentase Lembur
19 if (jamLembur = 1) then
    19.1 persenLembur <- 0.30
20 else if (jamLembur = 2) then
    20.1 persenLembur <- 0.32
21 else if (jamLembur = 3) then
    21.1 persenLembur <- 0.34
22 else if (jamLembur = 4) then
    22.1 persenLembur <- 0.36
23 else if (jamLembur >= 5) then
    23.1 persenLembur <- 0.38
24 else
    24.1 persenLembur <- 0.0 // Jika tidak lembur (0 jam) atau input < 1
25 end-if
26 // Tahap 3: Perhitungan Aritmetika Gaji Lembur dan Total Penghasilan
27 gajiLembur <- persenLembur * gajiPokok
28 totalPenghasilan <- gajiPokok + gajiLembur
29 // Tahap 4: Menampilkan Hasil Rincian Penghasilan (Output)
30 Cetak "======================================"
31 Cetak "     RINCIAN PENGHASILAN KARYAWAN     "
32 Cetak "======================================"
33 Cetak "Golongan Karyawan : ", golongan
34 Cetak "Gaji Pokok        : Rp ", gajiPokok
35 Cetak "Durasi Lembur     : ", jamLembur, " Jam"
36 Cetak "Persentase Lembur : ", persenLembur * 100, "%"
37 Cetak "Gaji Lembur       : Rp ", gajiLembur
38 Cetak "Total Penghasilan : Rp ", totalPenghasilan
39 Selesai
```

---

## Tabel Uji Coba Logika (*Trace Table / Dry Run*)

| Kasus Uji | Input `golongan` | Input `jamLembur` | Gaji Pokok (`gajiPokok`) | % Lembur (`persenLembur`) | Perhitungan Gaji Lembur (`gajiLembur`) | Total Penghasilan (`totalPenghasilan`) | Status / Alur Langkah |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **Uji 1** | **A** | **1 Jam** | Rp 5.000.000 | 30% (0.30) | 0.30 × 5.000.000 = Rp 1.500.000 | **Rp 6.500.000** | Sukses (Langkah 1 s.d. 39) |
| **Uji 2** | **B** | **2 Jam** | Rp 6.500.000 | 32% (0.32) | 0.32 × 6.500.000 = Rp 2.080.000 | **Rp 8.580.000** | Sukses (Langkah 1 s.d. 39) |
| **Uji 3** | **C** | **3 Jam** | Rp 9.500.000 | 34% (0.34) | 0.34 × 9.500.000 = Rp 3.230.000 | **Rp 12.730.000** | Sukses (Langkah 1 s.d. 39) |
| **Uji 4** | **A** | **4 Jam** | Rp 5.000.000 | 36% (0.36) | 0.36 × 5.000.000 = Rp 1.800.000 | **Rp 6.800.000** | Sukses (Langkah 1 s.d. 39) |
| **Uji 5** | **B** | **6 Jam** | Rp 6.500.000 | 38% (0.38) | 0.38 × 6.500.000 = Rp 2.470.000 | **Rp 8.970.000** | Sukses (Langkah 1 s.d. 39) |
| **Uji 6** | **C** | **0 Jam** | Rp 9.500.000 | 0% (0.00) | 0.00 × 9.500.000 = Rp 0 | **Rp 9.500.000** | Sukses (Langkah 1 s.d. 39) |
| **Uji 7** | **X** | **2 Jam** | - | - | - | *Output: "Error: Golongan tidak valid..."* | Gagal Golongan (Langkah 16.2 -> 39 Selesai) |
