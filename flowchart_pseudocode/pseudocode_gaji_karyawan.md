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
