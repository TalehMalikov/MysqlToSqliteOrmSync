import "reflect-metadata";
import { syncActors } from "./sync/sync-actor";
import { syncCategories } from "./sync/sync-category";
import { syncCustomers } from "./sync/sync-customer";
import { syncFilms } from "./sync/sync-film";
import { syncStores } from "./sync/sync-store";
import { syncFilmActors } from "./sync/sync-film-actor";
import { syncFilmCategories } from "./sync/sync-film-category";
import { syncPayments } from "./sync/sync_payment";

async function main() {
  console.log("=== Start DW sync ===");

  await syncActors();   // add more sync functions later
  await syncCategories();
  await syncCustomers();
  await syncFilms();
  await syncStores();
  await syncFilmActors();
  await syncFilmCategories();
  await syncPayments();

  console.log("=== DW sync finished ===");
}

main().catch((err) => {
  console.error("Fatal error during sync:", err);
  process.exit(1);
});
