import { validateCounts } from "../validate/validate-counts";

export async function validate() {
  console.log("=== VALIDATION START ===");

  await validateCounts(); // implement comparison logic later

  console.log("=== VALIDATION FINISHED ===");
}