import { Hono } from "hono";

import { requireSession, type AuthEnv } from "../auth.ts";
import type { Database } from "../db.ts";
import { ownedDevice } from "../devices/owned.ts";
import { readBody } from "../http.ts";
import { limit, type RateLimiter } from "../limits.ts";
import { signTicket, type JoinSigner } from "./signer.ts";

/** POST /v1/devices/{key}/join, mounted under the device routes, which sign the caller in. */
export function joinRoutes(
  { db }: Database,
  limiter: RateLimiter,
  signer: JoinSigner,
) {
  const perPhone = limit<AuthEnv>(
    limiter,
    "join",
    10,
    (c) => `${c.get("identity").userId}:${c.req.param("key") ?? ""}`,
  );

  return new Hono<AuthEnv>()
    .use("/:key/join", requireSession())
    .post("/:key/join", perPhone, async (c) => {
      const { userId } = c.get("identity");
      const phone = c.req.param("key");
      const { host } = await readBody(c, "JoinRequest");
      await ownedDevice(db, userId, phone, { role: "client" });
      await ownedDevice(db, userId, host, { role: "host" });

      const ticket = signTicket(signer, { account: userId, host, phone });
      await db
        .insertInto("audit")
        .values({
          user_id: userId,
          actor: `user:${userId}`,
          action: "join.issued",
          subject: phone,
          detail: JSON.stringify({ host, keyId: ticket.keyId }),
        })
        .execute();
      c.get("log").info(
        { phone: phone.slice(0, 8), host: host.slice(0, 8) },
        "issued a join ticket",
      );
      return c.json(ticket);
    });
}
