"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Browser-side auth client. Talks to /api/auth/* with secure httpOnly
 * cookies — no tokens are ever written to browser storage.
 *
 * `role`, `status` and `slug` are declared as non-input additional fields in
 * the server config, so they are returned but never client-writable.
 */
export const authClient = createAuthClient();
