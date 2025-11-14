import { validateActors } from "../sync/sync-actor";
import { validateCategories } from "../sync/sync-category";
import { validateCustomers } from "../sync/sync-customer";
import { validateFilms } from "../sync/sync-film";
import { validateStores } from "../sync/sync-store";
import { validateFilmActors } from "../sync/sync-film-actor";
import { validateFilmCategories } from "../sync/sync-film-category";
import { validatePayments } from "../sync/sync-payment";
import { validateRentals } from "../sync/sync-rental";
import { ValidationResult } from "../types/validation";

export async function validate() {
  console.log("=== VALIDATE (last 30 days) ===");

  const results: ValidationResult[] = [];

  results.push(await validateActors());
  results.push(await validateCategories());
  results.push(await validateCustomers());
  results.push(await validateFilms());
  results.push(await validateStores());
  results.push(await validateFilmActors());
  results.push(await validateFilmCategories());
  results.push(await validatePayments());
  results.push(await validateRentals());

  let allOk = true;

  for (const r of results) {
    if (r.ok) {
      console.log(`✔ ${r.name}: OK (${r.details})`);
    } else {
      console.error(`✘ ${r.name}: MISMATCH (${r.details})`);
      allOk = false;
    }
  }

  if (allOk) {
    console.log("Validation passed: MySQL and SQLite are consistent.");
  } else {
    console.error("Validation FAILED: see mismatches above.");
    process.exitCode = 1;
  }
}
