export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;

  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error(
      "Set JWT_SECRET to a securely generated secret of at least 32 bytes",
    );
  }

  return secret;
}
