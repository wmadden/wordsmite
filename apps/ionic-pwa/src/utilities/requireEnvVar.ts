/**
 * Returns the named environment variable if it's set, otherwise throws an error.
 *
 * Use this when accessing required environment variables to halt the app if they're missing.
 *
 * This will cause CI to fail and if somehow it occurs in production, the resulting error will cause the app to crash which will be automatically reported to us.
 */
export default function requireEnvVar(name: string): string {
  const value = import.meta.env[name];

  if (!value)
    throw new Error(`Missing required environment variable '${name}'`);

  return value;
}
