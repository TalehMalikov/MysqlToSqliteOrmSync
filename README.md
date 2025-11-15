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
      bridges/
        BridgeFilmActor.ts
        BridgeFilmCategory.ts
      facts/
        FactPayment.ts
        FactRental.ts

  sync/
    sync-actor.ts
    sync-category.ts
    sync-customer.ts
    sync-film.ts
    sync-store.ts
    sync-film-actor.ts
    sync-film-category.ts
    sync-payment.ts
    sync-rental.ts

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

* **TypeORM** for database connections/entities

  * MySQL → OLTP
  * SQLite → Data Warehouse

### **Databases**

* **MySQL**: source transactional DB
* **SQLite**: target analytics DW

### **Testing**

* **Jest** + **ts-jest** for integration tests
* Tests connect to real databases and print structured summary tables

### **Other**

* reflect-metadata
* dotenv (optional for env vars)

---

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

```
=== FULL LOAD COUNT SUMMARY ===
┌─────────┬────────────┬────────────┬───────┐
│ table   │ mysql      │ sqlite     │ equal │
└─────────┴────────────┴────────────┴───────┘
```
