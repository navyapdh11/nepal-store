-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "sizes" TEXT NOT NULL,
    "colors" TEXT NOT NULL,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "rating" TEXT NOT NULL DEFAULT '4.5',
    "reviews" INTEGER NOT NULL DEFAULT 0,
    "season" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");
