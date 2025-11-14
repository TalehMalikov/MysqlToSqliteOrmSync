import "reflect-metadata";
import { syncActors } from "./sync/sync-actor";
import { syncCategories } from "./sync/sync-category";
import { syncCustomers } from "./sync/sync-customer";

async function main() {
  console.log("=== Start DW sync ===");

  await syncActors();   // add more sync functions later
  await syncCategories();
  await syncCustomers();
  // ...

  console.log("=== DW sync finished ===");
}

main().catch((err) => {
  console.error("Fatal error during sync:", err);
  process.exit(1);
});
