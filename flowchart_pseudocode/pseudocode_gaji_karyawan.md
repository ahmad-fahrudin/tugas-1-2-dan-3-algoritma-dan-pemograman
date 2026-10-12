# Pseudocode Perhitungan Penghasilan Karyawan

```text
Program HitungPenghasilanKaryawan
{ Menghitung total penghasilan bulanan karyawan berdasarkan gaji pokok golongan dan persentase uang lembur }

DEKLARASI:
    char golongan
    int jamLembur
    float gajiPokok, persenLembur, gajiLembur, totalPenghasilan

ALGORITMA:
    // 1. Input Data
    print("Masukkan Golongan Karyawan (A/B/C): ")
    read(golongan)
    print("Masukkan Jumlah Jam Lembur: ")
    read(jamLembur)

    // 2. Tahap 1: Menentukan Gaji Pokok berdasarkan Golongan
    if (golongan = 'A' or golongan = 'a') then
        gajiPokok <- 5000000
    else if (golongan = 'B' or golongan = 'b') then
        gajiPokok <- 6500000
    else if (golongan = 'C' or golongan = 'c') then
        gajiPokok <- 9500000
    else
        print("Error: Golongan tidak valid! Masukkan hanya golongan A, B, atau C.")
        exit
    endif

    // 3. Tahap 2: Menentukan Persentase Lembur
    if (jamLembur = 1) then
        persenLembur <- 0.30
    else if (jamLembur = 2) then
        persenLembur <- 0.32
    else if (jamLembur = 3) then
        persenLembur <- 0.34
    else if (jamLembur = 4) then
        persenLembur <- 0.36
    else if (jamLembur >= 5) then
        persenLembur <- 0.38
    else
        persenLembur <- 0.0
    endif

    // 4. Tahap 3: Perhitungan Gaji Lembur dan Total Penghasilan
    gajiLembur <- persenLembur * gajiPokok
    totalPenghasilan <- gajiPokok + gajiLembur

    // 5. Tahap 4: Menampilkan Output
    print("Gaji Pokok        : Rp ", gajiPokok)
    print("Gaji Lembur       : Rp ", gajiLembur)
    print("Total Penghasilan : Rp ", totalPenghasilan)

end
```



## Tabel Uji Java 

| Kasus Uji | Input `golongan` | Input `jamLembur` | Gaji Pokok (`gajiPokok`) | % Lembur (`persenLembur`) | Perhitungan Gaji Lembur (`gajiLembur`) | Total Penghasilan (`totalPenghasilan`) |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Uji 1** | **A** | **1 Jam** | Rp 5.000.000 | 30% (0.30) | 0.30 × 5.000.000 = Rp 1.500.000 | **Rp 6.500.000** |
| **Uji 2** | **B** | **2 Jam** | Rp 6.500.000 | 32% (0.32) | 0.32 × 6.500.000 = Rp 2.080.000 | **Rp 8.580.000** |
| **Uji 3** | **C** | **3 Jam** | Rp 9.500.000 | 34% (0.34) | 0.34 × 9.500.000 = Rp 3.230.000 | **Rp 12.730.000** |
| **Uji 4** | **A** | **4 Jam** | Rp 5.000.000 | 36% (0.36) | 0.36 × 5.000.000 = Rp 1.800.000 | **Rp 6.800.000** |
| **Uji 5** | **B** | **6 Jam** | Rp 6.500.000 | 38% (0.38) | 0.38 × 6.500.000 = Rp 2.470.000 | **Rp 8.970.000** |
| **Uji 6** | **C** | **0 Jam** | Rp 9.500.000 | 0% (0.00) | 0.00 × 9.500.000 = Rp 0 | **Rp 9.500.000** |
| **Uji 7** | **X** | **2 Jam** | - | - | - | *Output: "Error: Golongan tidak valid..."* |
