import { syncActorsIncremental } from "../sync/sync-actor";
import { syncCategoriesIncremental } from "../sync/sync-category";
import { syncCustomersIncremental } from "../sync/sync-customer";
import { syncFilmsIncremental } from "../sync/sync-film";
import { syncStoresIncremental } from "../sync/sync-store";
import { syncFilmActorsIncremental } from "../sync/sync-film-actor";
import { syncFilmCategoriesIncremental } from "../sync/sync-film-category";
import { syncPaymentsIncremental } from "../sync/sync-payment";
import { syncRentalsIncremental } from "../sync/sync-rental";
import { syncDate } from "../sync/sync-date";

export async function incremental() {
  console.log("=== INCREMENTAL SYNC START ===");

  await syncActorsIncremental();
  await syncCategoriesIncremental();
  await syncCustomersIncremental();
  await syncFilmsIncremental();
  await syncStoresIncremental();
  await syncFilmActorsIncremental();
  await syncFilmCategoriesIncremental();
  await syncPaymentsIncremental();
  await syncRentalsIncremental();
  await syncDate();

  console.log("=== INCREMENTAL SYNC FINISHED ===");
}