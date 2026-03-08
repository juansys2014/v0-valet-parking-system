require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL no está definida");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaMariaDb(url) });

async function main() {
  const result = await prisma.appUser.updateMany({
    where: { name: "Admin" },
    data: { isAdmin: true },
  });
  console.log("Usuarios Admin actualizados:", result.count);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
