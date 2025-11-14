import { syncActorsFull } from "../sync/sync-actor";
import { syncCategoriesFull } from "../sync/sync-category";
import { syncCustomersFull } from "../sync/sync-customer";
import { syncFilmsFull } from "../sync/sync-film";
import { syncStoresFull } from "../sync/sync-store";
import { syncFilmActorsFull } from "../sync/sync-film-actor";
import { syncFilmCategoriesFull } from "../sync/sync-film-category";
import { syncPaymentsFull } from "../sync/sync-payment";
import { syncRentalsFull } from "../sync/sync-rental";
import { syncDateFull } from "../sync/sync-date";

export async function fullLoad() {
  console.log("=== FULL LOAD START ===");

  await syncActorsFull();
  await syncCategoriesFull();
  await syncCustomersFull();
  await syncFilmsFull();
  await syncStoresFull();
  await syncFilmActorsFull();
  await syncFilmCategoriesFull();
  await syncPaymentsFull();
  await syncRentalsFull();
  await syncDateFull();

  console.log("=== FULL LOAD FINISHED ===");
}