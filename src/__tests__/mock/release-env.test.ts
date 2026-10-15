import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { isReleaseEnabled } from "@/mock/release-env";

const dirs: string[] = [];
function dirWithEnv(contents?: string) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "release-env-"));
  dirs.push(dir);
  if (contents !== undefined) fs.writeFileSync(path.join(dir, ".env"), contents);
  return dir;
}

afterEach(() => {
  dirs.splice(0).forEach((dir) => fs.rmSync(dir, { recursive: true }));
});

describe("isReleaseEnabled", () => {
  it("is off without the flag", () => {
    expect(isReleaseEnabled(dirWithEnv(), {})).toBe(false);
    expect(isReleaseEnabled(dirWithEnv("NODE_ENV=production\n"), {})).toBe(false);
    expect(isReleaseEnabled(dirWithEnv("# NODE_ENV=release\n"), {})).toBe(false);
  });

  it("reads NODE_ENV=release or NEXT_PUBLIC_APP_ENV=release from .env", () => {
    expect(isReleaseEnabled(dirWithEnv("API_URL=x\nNODE_ENV=release"), {})).toBe(true);
    expect(isReleaseEnabled(dirWithEnv('NEXT_PUBLIC_APP_ENV="release"\n'), {})).toBe(true);
  });

  it("accepts the flag from the process environment", () => {
    expect(isReleaseEnabled(dirWithEnv(), { NODE_ENV: "release" })).toBe(true);
  });
});
