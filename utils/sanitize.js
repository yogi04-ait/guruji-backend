export const sanitize = (value = "") =>
    String(value)
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");