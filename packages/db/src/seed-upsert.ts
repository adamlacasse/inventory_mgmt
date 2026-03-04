import process from "node:process";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

type BootstrapUser = {
  email: string;
  password: string;
  name: string;
  role: "admin" | "operator";
};

function isBlank(value: string | undefined): boolean {
  return !value || value.trim().length === 0;
}

function readRequiredEnvironment(name: string): string {
  const value = process.env[name];
  if (isBlank(value)) {
    throw new Error(`${name} is required for db:seed:upsert.`);
  }

  return (value as string).trim();
}

function maybeReadEnvironment(name: string): string | undefined {
  const value = process.env[name];
  return isBlank(value) ? undefined : (value as string).trim();
}

function readBootstrapUsers(): BootstrapUser[] {
  const admin: BootstrapUser = {
    email: readRequiredEnvironment("BOOTSTRAP_ADMIN_EMAIL"),
    password: readRequiredEnvironment("BOOTSTRAP_ADMIN_PASSWORD"),
    name: maybeReadEnvironment("BOOTSTRAP_ADMIN_NAME") ?? "Admin User",
    role: "admin",
  };

  const operatorEmail = maybeReadEnvironment("BOOTSTRAP_OPERATOR_EMAIL");
  const operatorPassword = maybeReadEnvironment("BOOTSTRAP_OPERATOR_PASSWORD");
  const operatorName = maybeReadEnvironment("BOOTSTRAP_OPERATOR_NAME") ?? "Operator User";

  if ((operatorEmail && !operatorPassword) || (!operatorEmail && operatorPassword)) {
    throw new Error(
      "BOOTSTRAP_OPERATOR_EMAIL and BOOTSTRAP_OPERATOR_PASSWORD must be set together when using operator bootstrap.",
    );
  }

  if (!operatorEmail || !operatorPassword) {
    return [admin];
  }

  return [
    admin,
    {
      email: operatorEmail,
      password: operatorPassword,
      name: operatorName,
      role: "operator",
    },
  ];
}

async function seedUpsert(): Promise<void> {
  const users = readBootstrapUsers();

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        passwordHash,
        name: user.name,
        role: user.role,
      },
      create: {
        email: user.email,
        passwordHash,
        name: user.name,
        role: user.role,
      },
    });
  }

  console.log(
    `Upserted ${users.length} bootstrap user(s) by email without modifying products or transactions.`,
  );
}

seedUpsert()
  .catch((error) => {
    console.error("Bootstrap seed upsert failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
