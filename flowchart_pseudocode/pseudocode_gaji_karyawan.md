# Pseudocode Perhitungan Penghasilan Karyawan

```text
Algoritma HitungPenghasilanKaryawan
{ Menghitung total penghasilan bulanan karyawan berdasarkan gaji pokok golongan dan persentase uang lembur }

DEKLARASI:
    golongan : karakter
    jamLembur : integer
    gajiPokok, persenLembur, gajiLembur, totalPenghasilan : real

ALGORITMA:
    // 1. Input Data
    Input(golongan)
    Input(jamLembur)

    // 2. Tahap 1: Menentukan Gaji Pokok berdasarkan Golongan
    jika (golongan = 'A' atau golongan = 'a') maka
        gajiPokok <- 5000000
    selain itu jika (golongan = 'B' atau golongan = 'b') maka
        gajiPokok <- 6500000
    selain itu jika (golongan = 'C' atau golongan = 'c') maka
        gajiPokok <- 9500000
    selain itu
        Cetak "Error: Golongan tidak valid! Masukkan hanya golongan A, B, atau C."
        Selesai
    akhir-jika

    // 3. Tahap 2: Menentukan Persentase Lembur
    jika (jamLembur = 1) maka
        persenLembur <- 0.30
    selain itu jika (jamLembur = 2) maka
        persenLembur <- 0.32
    selain itu jika (jamLembur = 3) maka
        persenLembur <- 0.34
    selain itu jika (jamLembur = 4) maka
        persenLembur <- 0.36
    selain itu jika (jamLembur >= 5) maka
        persenLembur <- 0.38
    selain itu
        persenLembur <- 0.0
    akhir-jika

    // 4. Tahap 3: Perhitungan Gaji Lembur dan Total Penghasilan
    gajiLembur <- persenLembur * gajiPokok
    totalPenghasilan <- gajiPokok + gajiLembur

    // 5. Tahap 4: Menampilkan Output
    Cetak "Gaji Pokok        : Rp ", gajiPokok
    Cetak "Gaji Lembur       : Rp ", gajiLembur
    Cetak "Total Penghasilan : Rp ", totalPenghasilan

    Selesai
```
