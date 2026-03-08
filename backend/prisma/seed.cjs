require("dotenv").config();
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");

function hashPassword(plain) {
  return crypto.createHash("sha256").update(plain, "utf8").digest("hex");
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const prisma = new PrismaClient({ datasourceUrl: url });
  const count = await prisma.appUser.count();
  if (count > 0) return;
  await prisma.appUser.create({
    data: {
      name: "Admin",
      passwordHash: hashPassword("admin"),
      isAdmin: true,
      showCheckin: true,
      showCheckout: true,
      showVehicles: true,
      showAlerts: true,
      showHistory: true,
    },
  });
  console.log("Seed: usuario Admin creado (contraseña: admin)");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
