import "reflect-metadata";
import { syncActors } from "./sync/sync-actor";

async function main() {
  console.log("=== Start DW sync ===");

  await syncActors();   // add more sync functions later
  // await syncFilms();
  // await syncCustomers();
  // ...

  console.log("=== DW sync finished ===");
}

main().catch((err) => {
  console.error("Fatal error during sync:", err);
  process.exit(1);
});
