import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  await prisma.outtakeItem.deleteMany();
  await prisma.intakeItem.deleteMany();
  await prisma.outtakeTransaction.deleteMany();
  await prisma.intakeTransaction.deleteMany();
  await prisma.product.deleteMany();

  const blueDream = await prisma.product.create({
    data: {
      productName: "Blue Dream",
      productCategory: "Flower",
      lotNumber: "LOT-100",
    },
  });

  const sunsetGelato = await prisma.product.create({
    data: {
      productName: "Sunset Gelato",
      productCategory: "Flower",
      lotNumber: "LOT-214",
    },
  });

  const mintCart = await prisma.product.create({
    data: {
      productName: "Mint Kush Cart",
      productCategory: "Vape",
      lotNumber: "LOT-778",
    },
  });

  const citrusChew = await prisma.product.create({
    data: {
      productName: "Citrus Chew",
      productCategory: "Edible",
      lotNumber: "LOT-433",
    },
  });

  await prisma.intakeTransaction.create({
    data: {
      date: new Date("2026-02-10T12:00:00.000Z"),
      notes: "Initial receiving batch",
      saved: true,
      items: {
        create: [
          { productId: blueDream.id, units: 20 },
          { productId: sunsetGelato.id, units: 14 },
          { productId: mintCart.id, units: 52 },
          { productId: citrusChew.id, units: 31 },
        ],
      },
    },
  });

  await prisma.intakeTransaction.create({
    data: {
      date: new Date("2026-02-11T12:00:00.000Z"),
      notes: "Supplemental flower intake",
      saved: true,
      items: {
        create: [{ productId: blueDream.id, units: 8 }],
      },
    },
  });

  await prisma.outtakeTransaction.create({
    data: {
      date: new Date("2026-02-12T18:30:00.000Z"),
      customer: "Customer-001",
      notes: "Retail sale",
      saved: true,
      items: {
        create: [
          { productId: blueDream.id, units: 5 },
          { productId: mintCart.id, units: 6 },
        ],
      },
    },
  });

  console.log("Seed completed: demo products, intake, and outtake transactions created.");
}

seed()
  .catch((error) => {
    console.error("Seed failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
