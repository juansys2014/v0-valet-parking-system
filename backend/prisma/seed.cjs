const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");

function hashPassword(plain) {
  return crypto.createHash("sha256").update(plain, "utf8").digest("hex");
}

async function main() {
  const prisma = new PrismaClient();
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
