-- CreateEnum
CREATE TYPE "SaleChannel" AS ENUM ('WEB', 'APP', 'MARKETPLACE', 'SOCIAL', 'AFFILIATE');

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "segment" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productSku" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "channel" "SaleChannel" NOT NULL DEFAULT 'WEB',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "Customer_country_createdAt_idx" ON "Customer"("country", "createdAt");

-- CreateIndex
CREATE INDEX "Customer_segment_idx" ON "Customer"("segment");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_isDeleted_category_price_idx" ON "Product"("isDeleted", "category", "price");

-- CreateIndex
CREATE INDEX "Product_isDeleted_stock_idx" ON "Product"("isDeleted", "stock");

-- CreateIndex
CREATE INDEX "Sale_createdAt_id_idx" ON "Sale"("createdAt", "id");

-- CreateIndex
CREATE INDEX "Sale_customerId_createdAt_idx" ON "Sale"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "Sale_productId_createdAt_idx" ON "Sale"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "Sale_channel_createdAt_idx" ON "Sale"("channel", "createdAt");

-- CreateIndex
CREATE INDEX "Sale_total_idx" ON "Sale"("total");

-- CreateIndex
CREATE INDEX "Sale_quantity_idx" ON "Sale"("quantity");

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
