import type { DBSchema, IDBPDatabase } from "idb";
import { openDB } from "idb";

export type InvoiceStatus = "draft" | "edited" | "paid";

export interface Invoice {
  id: string;
  reference: string;
  customerId: string;
  date: string;
  status: InvoiceStatus;
}

export interface Customer {
  id: string;
  name: string;
}

interface Schema extends DBSchema {
  invoices: {
    key: string;
    value: Invoice;
    indexes: {
      "by-customer": string;
      "by-status": string;
      "by-reference": string;
      "by-date-reference": string;
      "by-customer-reference": string[];
      "by-customer-date-reference": string[];
    };
  };
  customers: {
    key: string;
    value: Customer;
    indexes: {
      "by-name": string;
    };
  };
}

let db: IDBPDatabase<Schema>;

export async function getDB(): Promise<IDBPDatabase<Schema>> {
  if (db) {
    return db;
  } else {
    db = await createDB();
  }

  const invoiceCount = await db.count("invoices");

  if (invoiceCount < INVOICES_COUNT) {
    await initDB(db);
  }

  return db;
}

function createDB(): Promise<IDBPDatabase<Schema>> {
  return openDB<Schema>("test", 1, {
    upgrade(db: IDBPDatabase<Schema>, oldVersion: number) {
      if (oldVersion < 1) {
        const customerStore = db.createObjectStore("customers", {
          keyPath: "id",
        });
        customerStore.createIndex("by-name", "name");

        const invoiceStore = db.createObjectStore("invoices", {
          keyPath: "id",
        });
        invoiceStore.createIndex("by-customer", "customerId", {
          unique: false,
        });
        invoiceStore.createIndex("by-status", "status");
        invoiceStore.createIndex("by-reference", "reference");
        invoiceStore.createIndex("by-date-reference", ["date", "reference"]);
        invoiceStore.createIndex(
          "by-customer-reference",
          ["customerId", "reference"],

        );
        invoiceStore.createIndex(
          "by-customer-date-reference",
          ["customerId", "date", "reference"],

        );
      }
    },
  });
}

function randomId(): string {
  const id = Math.random().toString(36).substring(2, 11);
  return id.length === 9 ? id : randomId();
}

function randomDate(): string {
  const date = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

function randomElement(array: string[]): string {
  return array[Math.floor(Math.random() * array.length)];
}

const INVOICES_COUNT = 10000;
const CUSTOMER_COUNT = 100;
let initInProgress = false;

async function initDB(db: IDBPDatabase<Schema>) {
  if (initInProgress) {
    return;
  }
  initInProgress = true;

  const tx = db.transaction(["customers", "invoices"], "readwrite");

  try {
    const customerIds = [];

    for (let i = 1; i <= CUSTOMER_COUNT; i++) {
      const customerId = randomId();
      customerIds.push(customerId);
      await tx.objectStore("customers").add({
        id: customerId,
        name: `C${String(i).padStart(3, "0")}`,
      });
    }

    for (let i = 1; i <= INVOICES_COUNT; i++) {
      await tx.objectStore("invoices").add({
        id: randomId(),
        date: randomDate(),
        reference: `I${String(i).padStart(5, "0")}`,
        customerId: randomElement(customerIds),
        status: randomElement(["draft", "edited", "paid"]) as InvoiceStatus,
      });
    }

    await tx.done;
  } catch (e) {
    tx.abort();
    throw e;
  }

  initInProgress = false;
}
