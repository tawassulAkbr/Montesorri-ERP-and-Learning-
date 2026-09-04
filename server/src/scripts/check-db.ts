import { prisma } from '../db';
async function main() {
  console.log(await prisma.school.findMany());
  console.log(await prisma.admin.findMany());
}
main();
