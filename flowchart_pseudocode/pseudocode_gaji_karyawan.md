# Pseudocode Perhitungan Penghasilan Karyawan

```text
Program HitungPenghasilanKaryawan

// Deklarasi Variabel dan Tipe Data:
char golongan
int jamLembur
float gajiPokok, persenLembur, gajiLembur, totalPenghasilan

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
