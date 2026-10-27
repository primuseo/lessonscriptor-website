import postgres from 'postgres';
import tls from 'node:tls';

// Self-hosted Postgres 17 on the primuseo VPS (migrated off Neon Free, 2026-10-27).
// One client per function instance: postgres.js keeps TCP+TLS connections open, so
// creating a client per request would leak connections. Fluid compute reuses the
// instance across requests, so the warm path skips the TLS handshake.
let client: ReturnType<typeof postgres> | undefined;

export function getDb() {
  if (!client) {
    const url = process.env.LS_DATABASE_URL!;
    const ca = process.env.LS_DATABASE_CA_CERT;
    // The server cert is self-signed, so it is pinned as the CA. postgres.js doesn't pass
    // an IP host through to TLS, so check the cert's IP SAN against the URL host explicitly.
    const host = new URL(url).hostname;
    client = postgres(url, {
      ssl: ca
        ? {
            ca: ca.replace(/\\n/g, '\n'),
            checkServerIdentity: (_servername: string, cert: tls.PeerCertificate) => tls.checkServerIdentity(host, cert),
          }
        : 'require',
      max: 3,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return client;
}
