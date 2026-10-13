public final class TerminalStyle {

    private TerminalStyle() {
        // Utility class
    }

    public static final String RESET = "\u001B[0m";
    public static final String BOLD = "\u001B[1m";

    public static final String CYAN = "\u001B[36m";
    public static final String BRIGHT_CYAN = "\u001B[96m";
    public static final String BRIGHT_GREEN = "\u001B[92m";
    public static final String BRIGHT_YELLOW = "\u001B[93m";
    public static final String BRIGHT_RED = "\u001B[91m";
    public static final String BRIGHT_WHITE = "\u001B[97m";
    public static final String WHITE = "\u001B[37m";
    public static final String BRIGHT_MAGENTA = "\u001B[95m";

    public static final int CARD_INNER_WIDTH = 56;

    public static String formatBarisKartu(String bullet, String label, String valueText, String valueColor) {
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
