# Pseudocode Perhitungan Penghasilan Karyawan

```text
PROGRAM HitungPenghasilanKaryawan
{ Program untuk menghitung total penghasilan karyawan yang terdiri dari 
  Gaji Pokok berdasarkan Golongan dan Gaji Lembur berdasarkan Jam Lembur. }

DEKLARASI:
    golongan        : character    { Golongan karyawan: 'A', 'B', atau 'C' }
    jamLembur       : integer      { Durasi lembur dalam satuan jam }
    gajiPokok       : real         { Besaran gaji pokok (Rupiah) }
    persenLembur    : real         { Persentase lembur dalam desimal (contoh: 0.30 untuk 30%) }
    gajiLembur      : real         { Nominal uang lembur yang didapat }
    totalPenghasilan: real         { Jumlah penghasilan: gajiPokok + gajiLembur }

ALGORITMA:
    // Input Data
    INPUT(golongan)
    INPUT(jamLembur)

    // Inisialisasi variabel
    gajiPokok <- 0
    persenLembur <- 0.0

    // Tahap 1: Menentukan Gaji Pokok Berdasarkan Golongan
    IF (golongan = 'A' OR golongan = 'a') THEN
        gajiPokok <- 5000000
    ELSE IF (golongan = 'B' OR golongan = 'b') THEN
        gajiPokok <- 6500000
    ELSE IF (golongan = 'C' OR golongan = 'c') THEN
        gajiPokok <- 9500000
    ELSE
        OUTPUT("Error: Golongan tidak valid! Masukkan A, B, atau C.")
        EXIT PROGRAM
    ENDIF

    // Tahap 2: Menentukan Persentase Lembur Berdasarkan Jam Lembur
    IF (jamLembur = 1) THEN
        persenLembur <- 0.30
    ELSE IF (jamLembur = 2) THEN
        persenLembur <- 0.32
    ELSE IF (jamLembur = 3) THEN
        persenLembur <- 0.34
    ELSE IF (jamLembur = 4) THEN
        persenLembur <- 0.36
    ELSE IF (jamLembur >= 5) THEN
        persenLembur <- 0.38
    ELSE
        persenLembur <- 0.0    { Jika jam lembur <= 0 / tidak lembur }
    ENDIF

    // Tahap 3: Perhitungan Gaji Lembur dan Total Penghasilan
    gajiLembur <- persenLembur * gajiPokok
    totalPenghasilan <- gajiPokok + gajiLembur

    // Tahap 4: Menampilkan Hasil Output
    OUTPUT("=== RINCIAN PENGHASILAN KARYAWAN ===")
    OUTPUT("Golongan Karyawan : ", golongan)
    OUTPUT("Gaji Pokok        : Rp ", gajiPokok)
    OUTPUT("Durasi Lembur     : ", jamLembur, " Jam")
    OUTPUT("Persentase Lembur : ", persenLembur * 100, "%")
    OUTPUT("Gaji Lembur       : Rp ", gajiLembur)
    OUTPUT("Total Penghasilan : Rp ", totalPenghasilan)

SELESAI
```

---

# Tabel Uji Coba Logika (Trace Table / Dry Run)

| Kasus Uji | Input Golongan | Input Jam Lembur | Gaji Pokok | % Lembur | Hitungan Gaji Lembur | Total Penghasilan |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Uji 1** | **A** | **1 Jam** | Rp 5.000.000 | 30% | 30% × 5.000.000 = Rp 1.500.000 | **Rp 6.500.000** |
| **Uji 2** | **B** | **2 Jam** | Rp 6.500.000 | 32% | 32% × 6.500.000 = Rp 2.080.000 | **Rp 8.580.000** |
| **Uji 3** | **C** | **3 Jam** | Rp 9.500.000 | 34% | 34% × 9.500.000 = Rp 3.230.000 | **Rp 12.730.000** |
| **Uji 4** | **A** | **4 Jam** | Rp 5.000.000 | 36% | 36% × 5.000.000 = Rp 1.800.000 | **Rp 6.800.000** |
| **Uji 5** | **B** | **6 Jam** | Rp 6.500.000 | 38% | 38% × 6.500.000 = Rp 2.470.000 | **Rp 8.970.000** |
| **Uji 6** | **C** | **0 Jam** | Rp 9.500.000 | 0% | 0% × 9.500.000 = Rp 0 | **Rp 9.500.000** |
| **Uji 7** | **X** | **2 Jam** | - | - | - | *Output: "Golongan Tidak Valid"* |
