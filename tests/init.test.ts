import { init } from "../src/commands/init";
import { SqliteService } from "../src/sqlite/sqlite.service";
import { SQLiteDataSource } from "../src/sqlite/sqlite-data-source";

jest.setTimeout(30000);

describe("INIT SQLite DB", () => {
  it("initializes SQLite schema successfully", async () => {
    const originalExitCode = process.exitCode;

    const connectSpy = jest.spyOn(SqliteService.prototype, "connect");
    const closeSpy = jest.spyOn(SqliteService.prototype, "close");
    const syncSpy = jest.spyOn(SQLiteDataSource, "synchronize");

    const capturedLogs: string[] = [];
    const capturedErrors: string[] = [];

    const logSpy = jest.spyOn(console, "log").mockImplementation((msg) => {
      if (typeof msg === "string") capturedLogs.push(msg);
    });

    const errorSpy = jest.spyOn(console, "error").mockImplementation((msg) => {
      if (typeof msg === "string") capturedErrors.push(msg);
    });

    try {
      await init();
    } finally {
      logSpy.mockRestore();
      errorSpy.mockRestore();
      process.exitCode = originalExitCode;
    }

    const summary = [
      {
        step: "connect() called",
        ok: connectSpy.mock.calls.length > 0,
      },
      {
        step: "synchronize() called",
        ok: syncSpy.mock.calls.length > 0,
      },
      {
        step: "close() called",
        ok: closeSpy.mock.calls.length > 0,
      },
      {
        step: "no errors",
        ok: capturedErrors.length === 0,
      },
    ];

    console.log("\n=== INIT SUMMARY ===");
    console.table(summary);

    expect(summary.every((r) => r.ok)).toBe(true);
  });
});
