import "reflect-metadata";
import { init } from "./init";
import { fullLoad } from "./full-load";
import { incremental } from "./incremental";
import { validate } from "./validate";

async function main() {
  const cmd = process.argv[2];

  switch (cmd) {
    case "init":
      await init();
      break;

    case "full-load":
      await fullLoad();
      break;

    case "incremental":
      await incremental();
      break;

    case "validate":
      await validate();
      break;

    default:
      console.log(`
Usage:
  node cli.js <command>

Commands:
  init         Initialize SQLite analytics database
  full-load    Full load from MySQL → SQLite
  incremental  Incremental load (new/updated rows)
  validate     Validate row counts (default last 30 days)
`);
  }
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
