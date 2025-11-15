import "reflect-metadata";
import { init } from "./commands/init";
import { fullLoad } from "./commands/full-load";
import { incremental } from "./commands/incremental";
import { validate } from "./commands/validate";

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
      const days = parseInt(process.argv[3]) || 30;
      await validate(days);
      break;

    default:
      console.log(`Commands:
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
