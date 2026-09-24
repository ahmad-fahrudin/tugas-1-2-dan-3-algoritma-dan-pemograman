public enum Golongan {
    A(5_000_000.0),
    B(6_500_000.0),
    C(9_500_000.0);

    private final double gajiPokok;

    Golongan(double gajiPokok) {
        this.gajiPokok = gajiPokok;
    }

    public double getGajiPokok() {
        return gajiPokok;
    }

    public static Golongan fromChar(char kode) {
        for (Golongan g : values()) {
            if (g.name().equalsIgnoreCase(String.valueOf(kode))) {
                return g;
            }
        }
        throw new IllegalArgumentException("Golongan tidak valid: " + kode);
    }
}
