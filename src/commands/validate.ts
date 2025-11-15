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

export async function validate(days: number) {
  console.log(`=== VALIDATE (last ${days} days) ===`);

  const results: ValidationResult[] = [];

  results.push(await validateActors(days));
  results.push(await validateCategories(days));
  results.push(await validateCustomers(days));
  results.push(await validateFilms(days));
  results.push(await validateStores(days));
  results.push(await validateFilmActors(days));
  results.push(await validateFilmCategories(days));
  results.push(await validatePayments(days));
  results.push(await validateRentals(days));

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
