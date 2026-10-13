import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class WebServer {

    private static final int PORT = 8080;

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

        // Routing halaman web (HTML, CSS) dan API hitung
        server.createContext("/", exchange -> layaniFile(exchange, "index.html", "text/html; charset=UTF-8"));
        server.createContext("/style.css", exchange -> layaniFile(exchange, "style.css", "text/css; charset=UTF-8"));
        server.createContext("/hitung", WebServer::handleHitung);

        server.start();

        System.out.println("==================================================");
        System.out.println(" Tugas 2: Perhitungan Penghasilan Karyawan");
        System.out.println(" Server aktif di : http://localhost:" + PORT);
        System.out.println(" Silakan buka link di atas pada browser Anda.");
        System.out.println(" Tekan Ctrl+C untuk menghentikan server.");
        System.out.println("==================================================");
    }

    // =========================================================================
    // 1. LOGIKA PERHITUNGAN SESUAI SOAL TUGAS 2 (OPERATOR & STATEMEN IF)
    // =========================================================================

    // Tahap 1: Menentukan Gaji Pokok berdasarkan Golongan menggunakan Statemen IF
    public static double tentukanGajiPokok(char golongan) {
        char kode = Character.toUpperCase(golongan);

        if (kode == 'A') {
            return 5_000_000.0;
        } else if (kode == 'B') {
            return 6_500_000.0;
        } else if (kode == 'C') {
            return 9_500_000.0;
        } else {
            return -1.0; // Golongan tidak valid
        }
    }

    // Tahap 2: Menentukan Persentase Lembur berdasarkan Jam Lembur menggunakan Statemen IF
    public static double tentukanPersenLembur(int jamLembur) {
        if (jamLembur == 1) {
            return 0.30;
        } else if (jamLembur == 2) {
            return 0.32;
        } else if (jamLembur == 3) {
            return 0.34;
        } else if (jamLembur == 4) {
            return 0.36;
        } else if (jamLembur >= 5) {
            return 0.38;
        } else {
            return 0.00;
        }
    }

    // Tahap 3: Menghitung Gaji Lembur menggunakan Operator Perkalian (*)
    public static double hitungGajiLembur(double gajiPokok, double persenLembur) {
        return persenLembur * gajiPokok;
    }

    // Tahap 4: Menghitung Total Penghasilan menggunakan Operator Penjumlahan (+)
    public static double hitungTotalPenghasilan(double gajiPokok, double gajiLembur) {
        return gajiPokok + gajiLembur;
    }

    // =========================================================================
    // 2. SERVER WEB (MENERIMA INPUT DARI HTML & MENGIRIM HASIL)
    // =========================================================================

    // Menerima parameter dari browser, memproses perhitungan, dan mengirim JSON
    private static void handleHitung(HttpExchange exchange) throws IOException {
        try {
            // 1. Ambil data dari URL (contoh: /hitung?golongan=A&jam=2)
            String query = exchange.getRequestURI().getQuery();
            Map<String, String> param = parseQuery(query);

            char golongan = param.getOrDefault("golongan", "").charAt(0);
            int jamLembur = Integer.parseInt(param.getOrDefault("jam", "-1"));

            // 2. Validasi input
            double gajiPokok = tentukanGajiPokok(golongan);
            if (gajiPokok < 0 || jamLembur < 0) {
                kirimTeks(exchange, 400, "{\"error\":\"Golongan (A/B/C) atau jam lembur tidak valid!\"}");
                return;
            }

            // 3. Hitung hasil sesuai logika tugas 2
            double persenLembur = tentukanPersenLembur(jamLembur);
            double gajiLembur = hitungGajiLembur(gajiPokok, persenLembur);
            double total = hitungTotalPenghasilan(gajiPokok, gajiLembur);

            // 4. Kirim hasil format JSON ke browser
            String json = String.format(Locale.US,
                "{\"golongan\":\"%c\",\"gajiPokok\":%.0f,\"jamLembur\":%d,\"persenLembur\":%.0f,\"gajiLembur\":%.0f,\"totalPenghasilan\":%.0f}",
                Character.toUpperCase(golongan), gajiPokok, jamLembur, persenLembur * 100, gajiLembur, total
            );
            kirimTeks(exchange, 200, json);

        } catch (Exception e) {
            kirimTeks(exchange, 400, "{\"error\":\"Input tidak valid! Pastikan semua data terisi.\"}");
        }
    }

    // Mengurai query URL (misal: "golongan=A&jam=2") menjadi pasangan data
    private static Map<String, String> parseQuery(String query) {
        Map<String, String> map = new HashMap<>();
        if (query != null && !query.isEmpty()) {
            for (String item : query.split("&")) {
                String[] pair = item.split("=", 2);
                if (pair.length == 2) {
                    map.put(pair[0], pair[1]);
                }
            }
        }
        return map;
    }

    // Mengirimkan file statis (HTML atau CSS) ke browser
    private static void layaniFile(HttpExchange exchange, String namaFile, String type) throws IOException {
        byte[] data = Files.readAllBytes(Path.of(namaFile));
        exchange.getResponseHeaders().set("Content-Type", type);
        exchange.sendResponseHeaders(200, data.length);
        try (OutputStream out = exchange.getResponseBody()) {
            out.write(data);
        }
    }

    // Mengirimkan respon JSON / teks ke browser
    private static void kirimTeks(HttpExchange exchange, int status, String teks) throws IOException {
        byte[] data = teks.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(status, data.length);
        try (OutputStream out = exchange.getResponseBody()) {
            out.write(data);
        }
    }
}
