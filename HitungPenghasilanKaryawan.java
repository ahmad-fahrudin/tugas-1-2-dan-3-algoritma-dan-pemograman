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

    // ANSI ESCAPE CODES UNTUK STYLING MODERN TERMINAL (HIGH CONTRAST OPENCODE STYLE)
    public static final String RESET = "\u001B[0m";
    public static final String BOLD = "\u001B[1m";

    // Text Colors (High Contrast untuk Tema Gelap / Terang)
    public static final String CYAN = "\u001B[36m";
    public static final String BRIGHT_CYAN = "\u001B[96m";
    public static final String BRIGHT_GREEN = "\u001B[92m";
    public static final String BRIGHT_YELLOW = "\u001B[93m";
    public static final String BRIGHT_RED = "\u001B[91m";
    public static final String BRIGHT_WHITE = "\u001B[97m";
    public static final String WHITE = "\u001B[37m";
    public static final String BRIGHT_MAGENTA = "\u001B[95m";

    // Lebar bagian dalam kartu UI
    private static final int CARD_INNER_WIDTH = 56;

    public static void main(String[] args) {
        try (Scanner scanner = new Scanner(System.in)) {
            boolean lanjut = true;

            tampilkanBanner();

            while (lanjut) {
                jalankanPerhitungan(scanner);

                System.out.print("\n" + CYAN + "? " + RESET + BOLD + BRIGHT_WHITE + "Apakah ingin menghitung gaji lagi? " + RESET + BRIGHT_YELLOW + "(y/n) › " + RESET);
                String pilihan = scanner.nextLine().trim();
                if (pilihan.equalsIgnoreCase("n") || pilihan.equalsIgnoreCase("t")) {
                    lanjut = false;
                    System.out.println("\n" + BRIGHT_GREEN + "✔ " + RESET + BOLD + BRIGHT_WHITE + "Program selesai. " + RESET + WHITE + "Terima kasih telah menggunakan program ini!\n" + RESET);
                }
                System.out.println();
            }
        }
    }

    public static void tampilkanBanner() {
        System.out.println();
        System.out.println(CYAN + "╭" + "─".repeat(CARD_INNER_WIDTH) + "╮" + RESET);
        System.out.println(CYAN + "│" + RESET + BOLD + BRIGHT_WHITE + "  ◈ SISTEM PERHITUNGAN PENGHASILAN KARYAWAN             " + RESET + CYAN + "│" + RESET);
        System.out.println(CYAN + "│" + RESET + WHITE +              "    Tugas 2 • Algoritma dan Pemrograman                 " + RESET + CYAN + "│" + RESET);
        System.out.println(CYAN + "╰" + "─".repeat(CARD_INNER_WIDTH) + "╯" + RESET);
        System.out.println();
    }

    public static void tampilkanError(String pesan) {
        System.out.println("\n" + BRIGHT_RED + BOLD + "  ✖ [ERROR] " + RESET + BRIGHT_RED + pesan + RESET + "\n");
    }

    public static void jalankanPerhitungan(Scanner scanner) {
        // Form Input Header
        System.out.println(CYAN + "╭─ [ FORM INPUT DATA ] " + "─".repeat(CARD_INNER_WIDTH - 22) + "╮" + RESET);
        System.out.println(CYAN + "│" + RESET + WHITE + "  Silakan masukkan golongan dan jam lembur karyawan     " + RESET + CYAN + "│" + RESET);
        System.out.println(CYAN + "╰" + "─".repeat(CARD_INNER_WIDTH) + "╯" + RESET);

        // INPUT DATA GOLONGAN
        System.out.print(CYAN + "  ➜ " + RESET + BRIGHT_WHITE + "Masukkan Golongan Karyawan " + RESET + BRIGHT_YELLOW + "(A / B / C)" + RESET + " : ");
        String inputGolongan = scanner.nextLine().trim();

        if (inputGolongan.isEmpty()) {
            tampilkanError("Golongan tidak boleh kosong!");
            return;
        }

        char kodeGolongan = inputGolongan.charAt(0);

        // Tahap 1: Validasi dan Penentuan Gaji Pokok
        Golongan golongan;
        try {
            golongan = Golongan.fromChar(kodeGolongan);
        } catch (IllegalArgumentException e) {
            tampilkanError("Golongan '" + kodeGolongan + "' tidak valid! Pilihan yang tersedia: A, B, atau C.");
            return;
        }

        double gajiPokok = golongan.getGajiPokok();

        // INPUT DATA JAM LEMBUR
        System.out.print(CYAN + "  ➜ " + RESET + BRIGHT_WHITE + "Masukkan Jumlah Jam Lembur " + RESET + BRIGHT_YELLOW + "(jam)" + RESET + "        : ");
        String inputLembur = scanner.nextLine().trim();
        int jamLembur;
        try {
            jamLembur = Integer.parseInt(inputLembur);
        } catch (NumberFormatException e) {
            tampilkanError("Jam lembur harus berupa bilangan bulat!");
            return;
        }

        if (jamLembur < 0) {
            tampilkanError("Jam lembur tidak boleh bernilai negatif!");
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

        System.out.println();
        System.out.println(CYAN + "╭" + "─".repeat(CARD_INNER_WIDTH) + "╮" + RESET);
        System.out.println(CYAN + "│" + RESET + BOLD + BRIGHT_CYAN + "  RINCIAN PENGHASILAN KARYAWAN                          " + RESET + CYAN + "│" + RESET);
        System.out.println(CYAN + "├" + "─".repeat(CARD_INNER_WIDTH) + "┤" + RESET);
        System.out.println(formatBarisKartu("•", "Golongan Karyawan", "Golongan " + golongan, BRIGHT_CYAN + BOLD));
        System.out.println(formatBarisKartu("•", "Gaji Pokok", formatRupiah(gajiPokok), BRIGHT_YELLOW));
        System.out.println(formatBarisKartu("•", "Durasi Lembur", jamLembur + " Jam", BRIGHT_WHITE));
        System.out.println(formatBarisKartu("•", "Persentase Lembur", persenDisplay + "%", BRIGHT_MAGENTA));
        System.out.println(formatBarisKartu("•", "Nominal Gaji Lembur", formatRupiah(gajiLembur), BRIGHT_YELLOW));
        System.out.println(CYAN + "├" + "─".repeat(CARD_INNER_WIDTH) + "┤" + RESET);
        System.out.println(formatBarisKartu("★", "TOTAL PENGHASILAN", formatRupiah(totalPenghasilan), BRIGHT_GREEN + BOLD));
        System.out.println(CYAN + "╰" + "─".repeat(CARD_INNER_WIDTH) + "╯" + RESET);
        System.out.println(BRIGHT_GREEN + "  ✔ " + RESET + WHITE + "Perhitungan berhasil diselesaikan secara akurat." + RESET);
    }

    private static String formatBarisKartu(String bullet, String label, String valueText, String valueColor) {
        String prefix = String.format("   %s %-22s : ", bullet, label);
        int sisaSpasi = CARD_INNER_WIDTH - prefix.length() - valueText.length();
        String padding = " ".repeat(Math.max(0, sisaSpasi));

        return CYAN + "│" + RESET +
               BRIGHT_WHITE + prefix + RESET +
               valueColor + valueText + RESET +
               padding +
               CYAN + "│" + RESET;
    }
}
