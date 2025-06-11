import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create two initial agents
  const agent1 = await prisma.agent.upsert({
    where: { phoneNumber: process.env.AGENT_PHONE_NUMBER || '+15558675309' },
    update: {},
    create: {
      name: 'Alice',
      phoneNumber: process.env.AGENT_PHONE_NUMBER || '+15558675309',
      status: 'available',
    },
  });

  const agent2 = await prisma.agent.upsert({
    where: { phoneNumber: '+15552223333' },
    update: {},
    create: {
      name: 'Bob',
      phoneNumber: '+15552223333',
      status: 'available',
    },
  });

  console.log({ agent1, agent2 });
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 