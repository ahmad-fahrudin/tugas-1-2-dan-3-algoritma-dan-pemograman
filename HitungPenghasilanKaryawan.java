import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;
import java.util.Scanner;

public class HitungPenghasilanKaryawan {

    // PERSENTASE LEMBUR BERDASARKAN JAM KERJA LEMBUR
    public static final double PERSEN_LEMBUR_1_JAM = 0.30;
    public static final double PERSEN_LEMBUR_2_JAM = 0.32;
    public static final double PERSEN_LEMBUR_3_JAM = 0.34;
    public static final double PERSEN_LEMBUR_4_JAM = 0.36;
    public static final double PERSEN_LEMBUR_5_JAM_KEATAS = 0.38;
    public static final double PERSEN_LEMBUR_DEFAULT = 0.00;

    public static void main(String[] args) {
        try (Scanner scanner = new Scanner(System.in)) {
            boolean lanjut = true;

            while (lanjut) {
                jalankanPerhitungan(scanner);

                System.out.print("\nApakah ingin menghitung gaji lagi? (y/n): ");
                String pilihan = scanner.nextLine().trim();
                if (pilihan.equalsIgnoreCase("n") || pilihan.equalsIgnoreCase("t")) {
                    lanjut = false;
                    System.out.println("Program selesai. Terima kasih!");
                }
                System.out.println();
            }
        }
    }

    public static void jalankanPerhitungan(Scanner scanner) {
        // INPUT DATA
        System.out.print("Masukkan Golongan Karyawan (A/B/C): ");
        String inputGolongan = scanner.nextLine().trim();

        if (inputGolongan.isEmpty()) {
            System.out.println("Error: Golongan tidak boleh kosong!");
            return;
        }

        char kodeGolongan = inputGolongan.charAt(0);

        // Tahap 1: Validasi dan Penentuan Gaji Pokok
        Golongan golongan;
        try {
            golongan = Golongan.fromChar(kodeGolongan);
        } catch (IllegalArgumentException e) {
            System.out.println("Error: Golongan tidak valid! Masukkan hanya golongan A, B, atau C.");
            return;
        }

        double gajiPokok = golongan.getGajiPokok();

        System.out.print("Masukkan Jumlah Jam Lembur: ");
        String inputLembur = scanner.nextLine().trim();
        int jamLembur;
        try {
            jamLembur = Integer.parseInt(inputLembur);
        } catch (NumberFormatException e) {
            System.out.println("Error: Jam lembur harus berupa bilangan bulat!");
            return;
        }

        if (jamLembur < 0) {
            System.out.println("Error: Jam lembur tidak boleh bernilai negatif!");
            return;
        }

        // Tahap 2: Menentukan Persentase Lembur
        double persenLembur = tentukanPersenLembur(jamLembur);

        // Tahap 3: Perhitungan Aritmetika Gaji Lembur dan Total Penghasilan
        double gajiLembur = hitungGajiLembur(gajiPokok, persenLembur);
        double totalPenghasilan = hitungTotalPenghasilan(gajiPokok, gajiLembur);

        // Tahap 4: Menampilkan Rincian Hasil Perhitungan
        tampilkanRincianPenghasilan(
                golongan,
                gajiPokok,
                jamLembur,
                persenLembur,
                gajiLembur,
                totalPenghasilan
        );
    }

    public static double tentukanPersenLembur(int jamLembur) {
        if (jamLembur == 1) {
            return PERSEN_LEMBUR_1_JAM;
        } else if (jamLembur == 2) {
            return PERSEN_LEMBUR_2_JAM;
        } else if (jamLembur == 3) {
            return PERSEN_LEMBUR_3_JAM;
        } else if (jamLembur == 4) {
            return PERSEN_LEMBUR_4_JAM;
        } else if (jamLembur >= 5) {
            return PERSEN_LEMBUR_5_JAM_KEATAS;
        } else {
            return PERSEN_LEMBUR_DEFAULT;
        }
    }

    public static double hitungGajiLembur(double gajiPokok, double persenLembur) {
        return persenLembur * gajiPokok;
    }

    public static double hitungTotalPenghasilan(double gajiPokok, double gajiLembur) {
        return gajiPokok + gajiLembur;
    }

    public static String formatRupiah(double nominal) {
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.forLanguageTag("id-ID"));
        symbols.setGroupingSeparator('.');
        symbols.setDecimalSeparator(',');

        DecimalFormat formatter = new DecimalFormat("Rp #,##0", symbols);
        return formatter.format(nominal);
    }

    public static void tampilkanRincianPenghasilan(
            Golongan golongan,
            double gajiPokok,
            int jamLembur,
            double persenLembur,
            double gajiLembur,
            double totalPenghasilan) {

        int persenDisplay = (int) Math.round(persenLembur * 100);

        System.out.println("======================================");
        System.out.println("     RINCIAN PENGHASILAN KARYAWAN     ");
        System.out.println("======================================");
        System.out.printf("Golongan Karyawan : %s%n", golongan);
        System.out.printf("Gaji Pokok        : %s%n", formatRupiah(gajiPokok));
        System.out.printf("Durasi Lembur     : %d Jam%n", jamLembur);
        System.out.printf("Persentase Lembur : %d%%%n", persenDisplay);
        System.out.printf("Gaji Lembur       : %s%n", formatRupiah(gajiLembur));
        System.out.printf("Total Penghasilan : %s%n", formatRupiah(totalPenghasilan));
        System.out.println("======================================");
    }
}
