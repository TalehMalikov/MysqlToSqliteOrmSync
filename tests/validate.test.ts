import { fullLoad } from "../src/commands/full-load";
import { validate } from "../src/commands/validate";

jest.setTimeout(60_000);

describe("VALIDATE", () => {
  beforeAll(async () => {
    const originalLog = console.log;
    console.log = jest.fn();
    try {
      await fullLoad();
    } finally {
      console.log = originalLog;
    }
  });

  it("runs validation and shows a summary table", async () => {
    const originalExitCode = process.exitCode;

    const capturedLogs: string[] = [];
    const capturedErrors: string[] = [];

    const logSpy = jest.spyOn(console, "log").mockImplementation((msg) => {
      if (typeof msg === "string") capturedLogs.push(msg);
    });

    const errorSpy = jest.spyOn(console, "error").mockImplementation((msg) => {
      if (typeof msg === "string") capturedErrors.push(msg);
    });

    try {
      await validate(999); 

    } finally {
      logSpy.mockRestore();
      errorSpy.mockRestore();
      process.exitCode = originalExitCode;
    }

    const summary: { name: string; ok: boolean; details: string }[] = [];

    for (const line of [...capturedLogs, ...capturedErrors]) {

      let m = line.match(/^✔ (.+?): OK \((.+)\)$/);
      if (m) {
        summary.push({ name: m[1], ok: true, details: m[2] });
        continue;
      }

      m = line.match(/^✘ (.+?): MISMATCH \((.+)\)$/);
      if (m) {
        summary.push({ name: m[1], ok: false, details: m[2] });
      }
    }

    console.log("\n=== VALIDATION SUMMARY ===");
    console.table(summary);

    expect(summary.every((x) => x.ok)).toBe(true);
  });
});