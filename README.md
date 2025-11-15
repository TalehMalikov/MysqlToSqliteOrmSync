# MysqlToSqliteOrmSync


## 1. Project Overview & Purpose

**MysqlToSqliteOrmSync** is a TypeScript ETL pipeline that:

* **Reads transactional data from MySQL** (OLTP)
* **Transforms & loads it into a SQLite Data Warehouse**, modeled with:

  * Dimensions (DimActor, DimFilm, etc.)
  * Facts (FactPayment, FactRental)
  * Bridge tables (Film–Actor, Film–Category)
* Supports:

  * **Full Load** – rebuild entire DW
  * **Incremental Sync** – sync only new/updated rows
  * **Validation** – compare MySQL vs SQLite consistency
  * **Init** – create/reset SQLite schema
* Includes a full **Jest integration test suite** with clean terminal summary tables.

Ideal for:

* Learning ETL + warehousing concepts
* Building a small analytics store from OLTP data
* Running syncing pipelines locally or in cron jobs

---

## 2. Project Structure

```
src/
  cli.ts                    # CLI entrypoint (npm run sync ...)
  commands/
    init.ts
    full-load.ts
    incremental.ts
    validate.ts
  mysql/
    mysql.service.ts
    mysql-data-source.ts
    entity/
      Actor.ts
      Category.ts
      Customer.ts
      Film.ts
      Store.ts
      FilmActor.ts
      FilmCategory.ts
      Payment.ts
      Rental.ts
  sqlite/
    sqlite.service.ts
    sqlite-data-source.ts
    entity/
      dimensions/
        DimActor.ts
        DimCategory.ts
        DimCustomer.ts
        DimFilm.ts
        DimStore.ts
        DimDate.ts
      bridges/
        BridgeFilmActor.ts
        BridgeFilmCategory.ts
      facts/
        FactPayment.ts
        FactRental.ts
      system/
        SyncState.ts
  sync/
    sync-actor.ts
    sync-category.ts
    sync-customer.ts
    sync-date.ts
    sync-film.ts
    sync-store.ts
    sync-film-actor.ts
    sync-film-category.ts
    sync-payment.ts
    sync-rental.ts
  types/
    validation.ts
  utils/
    sync-state.ts
tests/
  full-load.test.ts
  incremental.test.ts
  validate.test.ts
  init.test.ts
```

---

## 3. Technologies & Libraries

### **Language**

* TypeScript (strict mode)

### **ORM**

* **[TypeORM](https://typeorm.io/)** for database connections/entities

  * MySQL → OLTP
  * SQLite → Data Warehouse

### **Databases**

* **[MySQL](https://www.mysql.com/)**: source transactional DB
* **[SQLite](https://www.sqlite.org/)**: target analytics DW

### **Testing**

* **[Jest](https://jestjs.io/)** + **[ts-jest](https://kulshekhar.github.io/ts-jest/)** for integration tests
* Tests connect to real databases and print structured summary tables

### **Other**

* reflect-metadata
* dotenv (optional for env vars)


## 4. CLI Command Instructions

All CLI interaction uses:

```
npm run sync <command> [args]
```

### 🔹 Show help

```bash
npm run sync
```

### 🔹 Initialize SQLite (drop + recreate schema)

```bash
npm run sync init
```

### 🔹 Full ETL Load (MySQL → SQLite)

```bash
npm run sync full-load
```

Loads **every** MySQL table into the DW.

### 🔹 Incremental Sync

```bash
npm run sync incremental
```

Loads **only new/updated rows**.

### 🔹 Validate Data (default 30 days)

```bash
npm run sync validate
```

### 🔹 Validate with custom day window

```bash
npm run sync validate 30000
```

Prints:

* ✔ OK
* ✘ MISMATCH
* Summary table of all entities

---

## 5. Running Tests

### Run all tests:

```bash
npm test
```

### Run a single test:

```bash
npx jest tests/full-load.test.ts
```

Available test files:

* `full-load.test.ts` — verifies **full sync** matches MySQL row counts
* `incremental.test.ts` — verifies **delta-based sync**
* `validate.test.ts` — verifies validation logic
* `init.test.ts` — verifies schema creation

Each test prints a **clear summary table** such as:

### 🔹 Test init command
```bash
npx jest tests/init.test.ts
```
=== FULL LOAD COUNT SUMMARY ===
    ┌─────────┬────────────────────────┬──────┐
    │ (index) │ step                   │ ok   │
    ├─────────┼────────────────────────┼──────┤
    │ 0       │ 'connect() called'     │ true │
    │ 1       │ 'synchronize() called' │ true │
    │ 2       │ 'close() called'       │ true │
    │ 3       │ 'no errors'            │ true │
    └─────────┴────────────────────────┴──────┘

 PASS  tests/init.test.ts
  INIT SQLite DB
    √ initializes SQLite schema successfully (108 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.929 s, estimated 2 s
Ran all test suites matching tests/init.test.ts.

### 🔹 Test full-load command
```bash
npx jest tests/full-load.test.ts
```
=== FULL LOAD COUNT SUMMARY ===
    ┌─────────┬───────────────────┬───────┬────────┬───────┐
    │ (index) │ table             │ mysql │ sqlite │ equal │
    ├─────────┼───────────────────┼───────┼────────┼───────┤
    │ 0       │ 'actors'          │ 210   │ 210    │ true  │
    │ 1       │ 'categories'      │ 19    │ 19     │ true  │
    │ 2       │ 'customers'       │ 600   │ 600    │ true  │
    │ 3       │ 'films'           │ 1005  │ 1005   │ true  │
    │ 4       │ 'stores'          │ 5     │ 5      │ true  │
    │ 5       │ 'film_actors'     │ 5466  │ 5466   │ true  │
    │ 6       │ 'film_categories' │ 1005  │ 1005   │ true  │
    │ 7       │ 'payments'        │ 16048 │ 16048  │ true  │
    │ 8       │ 'rentals'         │ 16050 │ 16050  │ true  │
    └─────────┴───────────────────┴───────┴────────┴───────┘

 PASS  tests/full-load.test.ts (8.733 s)
  FULL LOAD
    √ copies all rows from MySQL tables into SQLite DW tables (7412 ms)                                                                            
                                                                                                                                                   
Test Suites: 1 passed, 1 total                                                                                                                     
Tests:       1 passed, 1 total                                                                                                                     
Snapshots:   0 total
Time:        8.922 s, estimated 9 s
Ran all test suites matching tests/full-load.test.ts.

### 🔹 Test incremental command
```bash
npx jest tests/incremental.test.ts
```
=== INCREMENTAL SYNC SUMMARY ===
    ┌─────────┬───────────────────┬──────────────┬───────────────┬─────────────┬──────────────┬─────────────┐
    │ (index) │ table             │ mysql_before │ sqlite_before │ mysql_after │ sqlite_after │ status      │
    ├─────────┼───────────────────┼──────────────┼───────────────┼─────────────┼──────────────┼─────────────┤
    │ 0       │ 'actors'          │ 211          │ 211           │ 211         │ 211          │ '✓ SUCCESS' │
    │ 1       │ 'categories'      │ 19           │ 19            │ 19          │ 19           │ '✓ SUCCESS' │
    │ 2       │ 'customers'       │ 716          │ 694           │ 716         │ 716          │ '✓ SUCCESS' │
    │ 3       │ 'films'           │ 1029         │ 1015          │ 1029        │ 1029         │ '✓ SUCCESS' │
    │ 4       │ 'stores'          │ 8            │ 5             │ 8           │ 8            │ '✓ SUCCESS' │
    │ 5       │ 'film_actors'     │ 5466         │ 5466          │ 5466        │ 5466         │ '✓ SUCCESS' │
    │ 6       │ 'film_categories' │ 1005         │ 1005          │ 1005        │ 1005         │ '✓ SUCCESS' │
    │ 7       │ 'payments'        │ 16048        │ 16048         │ 16048       │ 16048        │ '✓ SUCCESS' │
    │ 8       │ 'rentals'         │ 16064        │ 16061         │ 16064       │ 16064        │ '✓ SUCCESS' │
    └─────────┴───────────────────┴──────────────┴───────────────┴─────────────┴──────────────┴─────────────┘

 PASS  tests/incremental.test.ts
  INCREMENTAL SYNC
    √ keeps MySQL and SQLite deltas in sync during incremental (1235 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        2.538 s, estimated 3 s
Ran all test suites matching tests/incremental.test.ts.

### 🔹 Test validate command
```bash
npx jest tests/validate.test.ts
```
=== VALIDATION SUMMARY ===
    ┌─────────┬────────────────────────────────┬──────┬────────────────────────────────────────┐
    │ (index) │ name                           │ ok   │ details                                │
    ├─────────┼────────────────────────────────┼──────┼────────────────────────────────────────┤
    │ 0       │ 'actors_last_30_days'          │ true │ 'MySQL: count=12 SQLite: count=12'     │
    │ 1       │ 'categories_last_30_days'      │ true │ 'MySQL: count=4 SQLite: count=4'       │
    │ 2       │ 'customers_last_30_days'       │ true │ 'MySQL: count=716 SQLite: count=716'   │
    │ 3       │ 'films_last_30_days'           │ true │ 'MySQL: count=316 SQLite: count=316'   │
    │ 4       │ 'stores_last_30_days'          │ true │ 'MySQL: count=8 SQLite: count=8'       │
    │ 5       │ 'film_actors_last_30_days'     │ true │ 'MySQL: count=5466 SQLite: count=5466' │
    │ 6       │ 'film_categories_last_30_days' │ true │ 'MySQL: count=1005 SQLite: count=1005' │
    │ 7       │ 'payments_last_30_days'        │ true │ 'MySQL: count=5 SQLite: count=5'       │
    │ 8       │ 'rentals_last_30_days'         │ true │ 'MySQL: count=20 SQLite: count=20'     │
    └─────────┴────────────────────────────────┴──────┴────────────────────────────────────────┘

 PASS  tests/validate.test.ts (9.121 s)
  VALIDATE
    √ runs validation and shows a summary table (735 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        9.311 s, estimated 10 s
Ran all test suites matching tests/validate.test.ts.
