import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  SaleChannel,
  TaskKind,
  TaskStatus,
} from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const CUSTOMER_COUNT = 3_000;
const PRODUCT_COUNT = 2_500;
const SALE_COUNT = 12_500;
const TASK_COUNT = 24;
const BATCH_SIZE = 1_000;

const categories = [
  "Electronics",
  "Home",
  "Fashion",
  "Beauty",
  "Sports",
  "Books",
  "Office",
] as const;

const countries = ["US", "MX", "CO", "ES", "AR", "BR"] as const;
const segments = ["new", "returning", "vip", "wholesale"] as const;
const channels = [
  SaleChannel.WEB,
  SaleChannel.APP,
  SaleChannel.MARKETPLACE,
  SaleChannel.SOCIAL,
  SaleChannel.AFFILIATE,
] as const;

const taskStatuses = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.REVIEW,
  TaskStatus.DONE,
] as const;
const taskKinds = [
  TaskKind.PURCHASE_ORDER,
  TaskKind.INVENTORY,
  TaskKind.COUPON,
] as const;
const taskKindLabels: Record<TaskKind, string> = {
  PURCHASE_ORDER: "Orden de compra",
  INVENTORY: "Tarea de inventario",
  COUPON: "Cupón",
};

async function main() {
  const customers = Array.from({ length: CUSTOMER_COUNT }, (_, index) => {
    const number = index + 1;
    return {
      id: `seed_customer_${String(number).padStart(5, "0")}`,
      name: `Demo Customer ${number}`,
      email: `demo.customer.${number}@pulsemarket.example`,
      country: countries[index % countries.length],
      segment: segments[index % segments.length],
      createdAt: new Date(Date.now() - (index % 365) * 24 * 60 * 60 * 1_000),
      updatedAt: new Date(),
    };
  });

  const products = Array.from({ length: PRODUCT_COUNT }, (_, index) => {
    const number = index + 1;
    const category = categories[index % categories.length];
    const priceInCents = 2_500 + ((index * 7919) % 47_500);

    return {
      id: `seed_product_${String(number).padStart(5, "0")}`,
      sku: `DEMO-${String(number).padStart(6, "0")}`,
      name: `${category} Demo Product ${number}`,
      category,
      price: (priceInCents / 100).toFixed(2),
      stock: (index * 17) % 250,
      createdAt: new Date(Date.now() - (index % 365) * 24 * 60 * 60 * 1_000),
      updatedAt: new Date(),
    };
  });

  for (let start = 0; start < customers.length; start += BATCH_SIZE) {
    await prisma.customer.createMany({
      data: customers.slice(start, start + BATCH_SIZE),
      skipDuplicates: true,
    });
  }

  for (let start = 0; start < products.length; start += BATCH_SIZE) {
    await prisma.product.createMany({
      data: products.slice(start, start + BATCH_SIZE),
      skipDuplicates: true,
    });
  }

  const sales = Array.from({ length: SALE_COUNT }, (_, index) => {
    const number = index + 1;
    const customerIndex = (index * 37) % CUSTOMER_COUNT;
    const productIndex = (index * 13) % PRODUCT_COUNT;
    const product = products[productIndex];
    const quantity = (index % 5) + 1;
    const unitPrice = Number(product.price);

    return {
      id: `seed_sale_${String(number).padStart(5, "0")}`,
      customerId: customers[customerIndex].id,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity,
      unitPrice: unitPrice.toFixed(2),
      total: (unitPrice * quantity).toFixed(2),
      channel: channels[index % channels.length],
      createdAt: new Date(Date.now() - (index % 365) * 24 * 60 * 60 * 1_000),
    };
  });

  for (let start = 0; start < sales.length; start += BATCH_SIZE) {
    await prisma.sale.createMany({
      data: sales.slice(start, start + BATCH_SIZE),
      skipDuplicates: true,
    });
  }

  // Kanban cards. `position` is the order inside each status column.
  const tasks = Array.from({ length: TASK_COUNT }, (_, index) => {
    const number = index + 1;
    const kind = taskKinds[index % taskKinds.length];
    const status = taskStatuses[index % taskStatuses.length];

    return {
      id: `seed_task_${String(number).padStart(5, "0")}`,
      title: `${taskKindLabels[kind]} #${number}`,
      description: `Elemento de ejemplo ${number} del tablero Kanban.`,
      kind,
      status,
      position: Math.floor(index / taskStatuses.length),
      updatedAt: new Date(),
    };
  });

  await prisma.task.createMany({ data: tasks, skipDuplicates: true });

  console.log(
    `Seed complete: ${CUSTOMER_COUNT} customers, ${PRODUCT_COUNT} products, ${SALE_COUNT} sales (18,000 records total) and ${TASK_COUNT} Kanban tasks.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
