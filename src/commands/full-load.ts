import { syncActors } from "../sync/sync-actor";
import { syncCategories } from "../sync/sync-category";
import { syncCustomers } from "../sync/sync-customer";
import { syncFilms } from "../sync/sync-film";
import { syncStores } from "../sync/sync-store";
import { syncFilmActors } from "../sync/sync-film-actor";
import { syncFilmCategories } from "../sync/sync-film-category";
import { syncPayments } from "../sync/sync_payment";
import { syncRentals } from "../sync/sync-rental";
import { syncDate } from "../sync/sync-date";

export async function fullLoad() {
  console.log("=== FULL LOAD START ===");

  await syncActors();
  await syncCategories();
  await syncCustomers();
  await syncFilms();
  await syncStores();
  await syncFilmActors();
  await syncFilmCategories();
  await syncPayments();
  await syncRentals();
  await syncDate();

  console.log("=== FULL LOAD FINISHED ===");
}