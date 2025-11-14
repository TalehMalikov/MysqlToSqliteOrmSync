import { MysqlService } from "../mysql/mysql.service";
import { SqliteService } from "../sqlite/sqlite.service";

import { Payment } from "../mysql/entity/Payment";
import { FactPayment } from "../sqlite/entity/facts/FactPayment";
import { DimCustomer } from "../sqlite/entity/dimensions/DimCustomer";
import { DimStore } from "../sqlite/entity/dimensions/DimStore";
import { ValidationResult } from "../types/validation";
import { getLastSync, updateLastSync } from "../utils/sync-state";

function generateDateKey(timestamp: Date | string): number {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return parseInt(`${year}${month}${day}`);
}

export async function syncPaymentsFull() {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try {
    const mysqlRepo = mysql.getRepo(Payment);
    const sqliteRepo = sqlite.getRepo(FactPayment);
    
    const dimCustomerRepo = sqlite.getRepo(DimCustomer);
    const dimStoreRepo = sqlite.getRepo(DimStore);
    
    const dimCustomers = await dimCustomerRepo.find();
    const dimStores = await dimStoreRepo.find();
    
    const customerKeyMap = new Map(dimCustomers.map(c => [c.customerId, c.customerKey]));
    const storeKeyMap = new Map(dimStores.map(s => [s.storeId, s.storeKey]));

    const payments = await mysqlRepo.find({ relations: ['customer'] });

    console.log(`MySQL: read ${payments.length} payments`);

    await sqliteRepo.clear();

    const factPayments: Partial<FactPayment>[] = payments
      .filter((p) => customerKeyMap.has(p.customerId) && storeKeyMap.has(p.customer?.storeId))
      .map((p) => ({
        paymentId: p.paymentId,
        dateKeyPaid: generateDateKey(p.paymentDate),
        customerKey: customerKeyMap.get(p.customerId)!,
        storeKey: storeKeyMap.get(p.customer.storeId)!,
        staffId: p.staffId,
        amount: p.amount,
      }));

    console.log(`Filtered ${payments.length - factPayments.length} invalid payments`);

    const BATCH_SIZE = 500;
    for (let i = 0; i < factPayments.length; i += BATCH_SIZE) {
      const batch = factPayments.slice(i, i + BATCH_SIZE);
      await sqliteRepo.save(batch);
    }

    console.log(`SQLite: inserted ${factPayments.length} fact_payment rows`);

    const newestLastUpdate = payments.reduce(
      (max, p) => (p.lastUpdate > max ? p.lastUpdate : max),
      new Date(0)
    );
    await updateLastSync("fact_payment", newestLastUpdate);
        
  } finally {
    await mysql.close();
    await sqlite.close();
  }
}

export async function syncPaymentsIncremental() {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try{
    const mysqlRepo = mysql.getRepo(Payment);
    const sqliteRepo = sqlite.getRepo(FactPayment);

    const dimCustomerRepo = sqlite.getRepo(DimCustomer);
    const dimStoreRepo = sqlite.getRepo(DimStore);

    const lastSync = await getLastSync("fact_payment");

    const dimCustomers = await dimCustomerRepo.find();
    const dimStores = await dimStoreRepo.find();

    const customerKeyMap = new Map(
      dimCustomers.map((c) => [c.customerId, c.customerKey])
    );
    const storeKeyMap = new Map(
      dimStores.map((s) => [s.storeId, s.storeKey])
    );

    const payments = await mysqlRepo.find({ relations: ["customer"] });

    const changed = payments.filter((p) => p.lastUpdate > lastSync);

    if (changed.length === 0) {
      console.log("No new or updated payments since last sync.");
      return;
    }

    const factPayments: Partial<FactPayment>[] = changed
      .filter(
        (p) =>
          customerKeyMap.has(p.customerId) &&
          storeKeyMap.has(p.customer?.storeId)
      )
      .map((p) => ({
        paymentId: p.paymentId,
        dateKeyPaid: generateDateKey(p.paymentDate),
        customerKey: customerKeyMap.get(p.customerId)!,
        storeKey: storeKeyMap.get(p.customer.storeId)!,
        staffId: p.staffId,
        amount: p.amount,
      }));

    const BATCH_SIZE = 500;
    for (let i = 0; i < factPayments.length; i += BATCH_SIZE) {
      const batch = factPayments.slice(i, i + BATCH_SIZE);
      await sqliteRepo.save(batch);
    }

    const newestLastUpdate = changed.reduce(
      (max, p) => (p.lastUpdate > max ? p.lastUpdate : max),
      lastSync
    );
    await updateLastSync("fact_payment", newestLastUpdate);
  }
  finally {
    await mysql.close();
    await sqlite.close();
  }
}

export async function validatePayments() : Promise<ValidationResult> {
  const mysql = new MysqlService();
  const sqlite = new SqliteService();

  await mysql.connect();
  await sqlite.connect();

  try {
    console.log("=== Payment validation started ===");

    const now = new Date();
    const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const mysqlRepo = mysql.getRepo(Payment);
    const mysqlRows = await mysqlRepo.find();

    const sqliteRepo = sqlite.getRepo(FactPayment);
    const sqliteRows = await sqliteRepo.find();

    const inWindow = (d: Date) => d >= from && d < now;

    const mysqlFiltered = mysqlRows.filter(r => inWindow(r.lastUpdate));
    const sqliteFiltered = sqliteRows.filter(r => inWindow(r.lastUpdate));

    const mysqlCount = mysqlFiltered.length;
    const sqliteCount = sqliteFiltered.length;

    const ok = mysqlCount === sqliteCount;

    console.log("=== Payment validation completed ===");

    return {
    name: "payments_last_30_days",
    ok,
    details: `MySQL: count=${mysqlCount} ` +
             `SQLite: count=${sqliteCount}`
    };
  }

  catch (err) {
    console.error("Payment validation FAILED:", err);
    return {
      name: "payments_last_30_days",
      ok: false,
      details: "Validation threw an error: " + (err as any).message
    };
  }

  finally {
    await mysql.close();
    await sqlite.close();
  }
}