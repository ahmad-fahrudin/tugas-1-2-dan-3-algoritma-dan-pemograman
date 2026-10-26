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

    public static final double[] ARRAY_GAJI = { 5000000.0, 6500000.0, 9500000.0 };
    public static final double[] ARRAY_LEMBUR = { 0.30, 0.32, 0.34, 0.36, 0.38 };

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

        server.createContext("/", WebServer::layaniFileStatis);
        server.createContext("/hitung", WebServer::handleHitung);

        server.start();

        System.out.println("Server berjalan di http://localhost:" + PORT);
    }

    public static double tentukanGajiPokok(char golongan) {
        char kode = Character.toUpperCase(golongan);

        if (kode == 'A') {
            return ARRAY_GAJI[0];
        } else if (kode == 'B') {
            return ARRAY_GAJI[1];
        } else if (kode == 'C') {
            return ARRAY_GAJI[2];
        } else {
            return -1.0;
        }
    }

    public static double tentukanPersenLembur(int jamLembur) {
        if (jamLembur == 1) {
            return ARRAY_LEMBUR[0];
        } else if (jamLembur == 2) {
            return ARRAY_LEMBUR[1];
        } else if (jamLembur == 3) {
            return ARRAY_LEMBUR[2];
        } else if (jamLembur == 4) {
            return ARRAY_LEMBUR[3];
        } else if (jamLembur >= 5) {
            return ARRAY_LEMBUR[4];
        } else if (jamLembur == 0) {
            return 0.00;
        } else {
            return -1.0;
        }
    }

    public static double hitungGajiLembur(double gajiPokok, double persenLembur) {
        return persenLembur * gajiPokok;
    }

    public static double hitungTotalPenghasilan(double gajiPokok, double gajiLembur) {
        return gajiPokok + gajiLembur;
    }

    private static void handleHitung(HttpExchange exchange) throws IOException {
        try {
            String query = exchange.getRequestURI().getQuery();
            Map<String, String> param = parseQuery(query);

            String golonganParam = param.getOrDefault("golongan", "").trim();
            if (golonganParam.isEmpty()) {
                kirimTeks(exchange, 400, "{\"error\":\"Golongan tidak boleh kosong!\"}");
                return;
            }

            char golongan = golonganParam.charAt(0);
            int jamLembur = Integer.parseInt(param.getOrDefault("jam", "-1"));

            double gajiPokok = tentukanGajiPokok(golongan);
            double persenLembur = tentukanPersenLembur(jamLembur);

            if (gajiPokok < 0 || persenLembur < 0) {
                kirimTeks(exchange, 400, "{\"error\":\"Golongan (A/B/C) atau jam lembur tidak valid!\"}");
                return;
            }

            double gajiLembur = hitungGajiLembur(gajiPokok, persenLembur);
            double total = hitungTotalPenghasilan(gajiPokok, gajiLembur);

            String json = String.format(Locale.US,
                "{\"golongan\":\"%c\",\"gajiPokok\":%.0f,\"jamLembur\":%d,\"persenLembur\":%.0f,\"gajiLembur\":%.0f,\"totalPenghasilan\":%.0f}",
                Character.toUpperCase(golongan), gajiPokok, jamLembur, persenLembur * 100, gajiLembur, total
            );
            kirimTeks(exchange, 200, json);

        } catch (Exception e) {
            kirimTeks(exchange, 400, "{\"error\":\"Input tidak valid! Pastikan semua data terisi.\"}");
        }
    }

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

    private static void layaniFileStatis(HttpExchange exchange) throws IOException {
        String uriPath = exchange.getRequestURI().getPath();
        if (uriPath == null || uriPath.equals("/") || uriPath.isEmpty()) {
            uriPath = "/index.html";
        }

        String pathClean = uriPath.startsWith("/") ? uriPath.substring(1) : uriPath;
        Path filePath = Path.of(pathClean).normalize();

        // Keamanan: cegah directory traversal ke luar direktori kerja
        if (filePath.startsWith("..") || !Files.exists(filePath) || Files.isDirectory(filePath)) {
            kirimTeks(exchange, 404, "{\"error\":\"File tidak ditemukan: " + uriPath + "\"}");
            return;
        }

        String mime = "application/octet-stream";
        String lower = pathClean.toLowerCase();
        if (lower.endsWith(".html")) mime = "text/html; charset=UTF-8";
        else if (lower.endsWith(".css")) mime = "text/css; charset=UTF-8";
        else if (lower.endsWith(".js")) mime = "application/javascript; charset=UTF-8";
        else if (lower.endsWith(".json")) mime = "application/json; charset=UTF-8";
        else if (lower.endsWith(".svg")) mime = "image/svg+xml";
        else if (lower.endsWith(".png")) mime = "image/png";
        else if (lower.endsWith(".ico")) mime = "image/x-icon";

        byte[] data = Files.readAllBytes(filePath);
        exchange.getResponseHeaders().set("Content-Type", mime);
        exchange.sendResponseHeaders(200, data.length);
        try (OutputStream out = exchange.getResponseBody()) {
            out.write(data);
        }
    }

    private static void kirimTeks(HttpExchange exchange, int status, String teks) throws IOException {
        byte[] data = teks.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(status, data.length);
        try (OutputStream out = exchange.getResponseBody()) {
            out.write(data);
        }
    }
}
