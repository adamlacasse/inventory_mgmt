-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productName" TEXT NOT NULL,
    "productCategory" TEXT NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "IntakeTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "notes" TEXT,
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "IntakeItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "intakeTransactionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "units" DECIMAL NOT NULL,
    CONSTRAINT "IntakeItem_intakeTransactionId_fkey" FOREIGN KEY ("intakeTransactionId") REFERENCES "IntakeTransaction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "IntakeItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OuttakeTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "customer" TEXT,
    "notes" TEXT,
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "OuttakeItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "outtakeTransactionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "units" DECIMAL NOT NULL,
    CONSTRAINT "OuttakeItem_outtakeTransactionId_fkey" FOREIGN KEY ("outtakeTransactionId") REFERENCES "OuttakeTransaction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OuttakeItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_productName_productCategory_lotNumber_key" ON "Product"("productName", "productCategory", "lotNumber");
