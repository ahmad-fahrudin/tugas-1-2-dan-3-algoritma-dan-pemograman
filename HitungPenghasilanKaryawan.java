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

            tampilkanBanner();

            while (lanjut) {
                jalankanPerhitungan(scanner);

                System.out.print("\n" + TerminalStyle.CYAN + "? " + TerminalStyle.RESET + TerminalStyle.BOLD + TerminalStyle.BRIGHT_WHITE + "Apakah ingin menghitung gaji lagi? " + TerminalStyle.RESET + TerminalStyle.BRIGHT_YELLOW + "(y/n) › " + TerminalStyle.RESET);
                String pilihan = scanner.nextLine().trim();
                if (pilihan.equalsIgnoreCase("n") || pilihan.equalsIgnoreCase("t")) {
                    lanjut = false;
                    System.out.println("\n" + TerminalStyle.BRIGHT_GREEN + "✔ " + TerminalStyle.RESET + TerminalStyle.BOLD + TerminalStyle.BRIGHT_WHITE + "Program selesai. " + TerminalStyle.RESET + TerminalStyle.WHITE + "Terima kasih telah menggunakan program ini!\n" + TerminalStyle.RESET);
                }
                System.out.println();
            }
        }
    }

    public static void tampilkanBanner() {
        System.out.println();
        System.out.println(TerminalStyle.CYAN + "╭" + "─".repeat(TerminalStyle.CARD_INNER_WIDTH) + "╮" + TerminalStyle.RESET);
        System.out.println(TerminalStyle.CYAN + "│" + TerminalStyle.RESET + TerminalStyle.BOLD + TerminalStyle.BRIGHT_WHITE + "  ◈ SISTEM PERHITUNGAN PENGHASILAN KARYAWAN             " + TerminalStyle.RESET + TerminalStyle.CYAN + "│" + TerminalStyle.RESET);
        System.out.println(TerminalStyle.CYAN + "│" + TerminalStyle.RESET + TerminalStyle.WHITE +              "    Tugas 2 • Algoritma dan Pemrograman                 " + TerminalStyle.RESET + TerminalStyle.CYAN + "│" + TerminalStyle.RESET);
        System.out.println(TerminalStyle.CYAN + "╰" + "─".repeat(TerminalStyle.CARD_INNER_WIDTH) + "╯" + TerminalStyle.RESET);
        System.out.println();
    }

    public static void tampilkanError(String pesan) {
        System.out.println("\n" + TerminalStyle.BRIGHT_RED + TerminalStyle.BOLD + "  ✖ [ERROR] " + TerminalStyle.RESET + TerminalStyle.BRIGHT_RED + pesan + TerminalStyle.RESET + "\n");
    }

    public static void jalankanPerhitungan(Scanner scanner) {
        // Form Input Header
        System.out.println(TerminalStyle.CYAN + "╭─ [ FORM INPUT DATA ] " + "─".repeat(TerminalStyle.CARD_INNER_WIDTH - 22) + "╮" + TerminalStyle.RESET);
        System.out.println(TerminalStyle.CYAN + "│" + TerminalStyle.RESET + TerminalStyle.WHITE + "  Silakan masukkan golongan dan jam lembur karyawan     " + TerminalStyle.RESET + TerminalStyle.CYAN + "│" + TerminalStyle.RESET);
        System.out.println(TerminalStyle.CYAN + "╰" + "─".repeat(TerminalStyle.CARD_INNER_WIDTH) + "╯" + TerminalStyle.RESET);

        // INPUT DATA GOLONGAN
        System.out.print(TerminalStyle.CYAN + "  ➜ " + TerminalStyle.RESET + TerminalStyle.BRIGHT_WHITE + "Masukkan Golongan Karyawan " + TerminalStyle.RESET + TerminalStyle.BRIGHT_YELLOW + "(A / B / C)" + TerminalStyle.RESET + " : ");
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
        System.out.print(TerminalStyle.CYAN + "  ➜ " + TerminalStyle.RESET + TerminalStyle.BRIGHT_WHITE + "Masukkan Jumlah Jam Lembur " + TerminalStyle.RESET + TerminalStyle.BRIGHT_YELLOW + "(jam)" + TerminalStyle.RESET + "        : ");
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
        System.out.println(TerminalStyle.CYAN + "╭" + "─".repeat(TerminalStyle.CARD_INNER_WIDTH) + "╮" + TerminalStyle.RESET);
        System.out.println(TerminalStyle.CYAN + "│" + TerminalStyle.RESET + TerminalStyle.BOLD + TerminalStyle.BRIGHT_CYAN + "  RINCIAN PENGHASILAN KARYAWAN                          " + TerminalStyle.RESET + TerminalStyle.CYAN + "│" + TerminalStyle.RESET);
        System.out.println(TerminalStyle.CYAN + "├" + "─".repeat(TerminalStyle.CARD_INNER_WIDTH) + "┤" + TerminalStyle.RESET);
        System.out.println(TerminalStyle.formatBarisKartu("•", "Golongan Karyawan", "Golongan " + golongan, TerminalStyle.BRIGHT_CYAN + TerminalStyle.BOLD));
        System.out.println(TerminalStyle.formatBarisKartu("•", "Gaji Pokok", formatRupiah(gajiPokok), TerminalStyle.BRIGHT_YELLOW));
        System.out.println(TerminalStyle.formatBarisKartu("•", "Durasi Lembur", jamLembur + " Jam", TerminalStyle.BRIGHT_WHITE));
        System.out.println(TerminalStyle.formatBarisKartu("•", "Persentase Lembur", persenDisplay + "%", TerminalStyle.BRIGHT_MAGENTA));
        System.out.println(TerminalStyle.formatBarisKartu("•", "Nominal Gaji Lembur", formatRupiah(gajiLembur), TerminalStyle.BRIGHT_YELLOW));
        System.out.println(TerminalStyle.CYAN + "├" + "─".repeat(TerminalStyle.CARD_INNER_WIDTH) + "┤" + TerminalStyle.RESET);
        System.out.println(TerminalStyle.formatBarisKartu("★", "TOTAL PENGHASILAN", formatRupiah(totalPenghasilan), TerminalStyle.BRIGHT_GREEN + TerminalStyle.BOLD));
        System.out.println(TerminalStyle.CYAN + "╰" + "─".repeat(TerminalStyle.CARD_INNER_WIDTH) + "╯" + TerminalStyle.RESET);
        System.out.println(TerminalStyle.BRIGHT_GREEN + "  ✔ " + TerminalStyle.RESET + TerminalStyle.WHITE + "Perhitungan berhasil diselesaikan secara akurat." + TerminalStyle.RESET);
    }


}
