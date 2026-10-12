import { pushAppValues, type PushApp } from "@sikemux/protocol";

import { readAppleKeySettings, type AppleKey } from "../apple-key.ts";
import { APNS_TOPICS } from "./apns.ts";
import { readServiceAccount, type ServiceAccount } from "./fcm.ts";

export interface PushSettings {
  /** The one phone app whose tokens this server accepts and whose credentials it holds. */
  app: PushApp;
  /** Whether a production server accepts iOS tokens from Apple's sandbox, for builds run from Xcode. */
  allowSandbox: boolean;
  /** The Firebase service account FCM sends as, or null when Android pushes are not set up. */
  fcm: ServiceAccount | null;
  /** The key APNs takes this server's pushes with, or null when iPhone pushes are not set up. */
  apns: (AppleKey & { topic: string }) | null;
}

/**
 * Reads PUSH_APP ("production" by default), APNS_ALLOW_SANDBOX ("1" to allow),
 * FCM_SERVICE_ACCOUNT_FILE, the path of the Firebase service account's JSON key, and
 * APNS_KEY_FILE, the path of Apple's .p8 push key, with its APNS_KEY_ID and APNS_TEAM_ID.
 */
export function readPush(
  env: NodeJS.ProcessEnv,
  problems: string[],
): PushSettings {
  const app = (env.PUSH_APP?.trim() || "production") as PushApp;
  if (!pushAppValues.includes(app))
    problems.push(`PUSH_APP is not one of ${pushAppValues.join(", ")}`);

  const sandbox = env.APNS_ALLOW_SANDBOX?.trim() || "0";
  if (sandbox !== "0" && sandbox !== "1")
    problems.push("APNS_ALLOW_SANDBOX is not 0 or 1");

  const path = env.FCM_SERVICE_ACCOUNT_FILE?.trim();
  let fcm: ServiceAccount | null = null;
  if (path) {
    try {
      fcm = readServiceAccount(path);
    } catch (error) {
      problems.push(
        `FCM_SERVICE_ACCOUNT_FILE ${path} ${(error as Error).message}`,
      );
    }
  }

  return {
    app,
    allowSandbox: app === "dev" || sandbox === "1",
    fcm,
    apns: readApns(env, app, problems),
  };
}

function readApns(
  env: NodeJS.ProcessEnv,
  app: PushApp,
  problems: string[],
): PushSettings["apns"] {
  const key = readAppleKeySettings(env, "APNS", problems);
  return key && { ...key, topic: APNS_TOPICS[app] };
}
