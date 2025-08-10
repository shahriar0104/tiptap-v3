import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean up existing data
  console.log('🧹 Cleaning up existing data...');
  await prisma.agendaItem.deleteMany();
  await prisma.boardMeeting.deleteMany();
  await prisma.user.deleteMany();

  // Create sample users
  console.log('👥 Creating sample users...');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@company.com',
        name: 'John Doe',
        role: 'ADMIN',
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@company.com',
        name: 'Jane Smith',
        role: 'USER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike.johnson@company.com',
        name: 'Mike Johnson',
        role: 'EDITOR',
      },
    }),
    prisma.user.create({
      data: {
        email: 'shadman.shahriar@dsinnovators.com',
        name: 'Shadman Shahriar',
        role: 'BOARD_MEMBER',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create sample board meetings with agenda items
  console.log('📋 Creating sample board meetings...');

  const boardMeetings = await Promise.all([
    // Board Meeting 1: Quarterly Review
    prisma.boardMeeting.create({
      data: {
        title: 'Q4 2024 Quarterly Review',
        description: 'Comprehensive review of Q4 2024 performance and strategic planning for Q1 2025',
        status: 'PUBLISHED',
        meetingDate: new Date('2024-12-15T10:00:00Z'),
        authorId: users[0].id,
        agendaItems: {
          create: [
            {
              title: 'Financial Performance Review',
              description: 'Review of Q4 financial metrics, revenue growth, and profitability analysis',
              order: 1,
              duration: 45,
              status: 'COMPLETED',
            },
            {
              title: 'Strategic Initiatives Update',
              description: 'Update on key strategic initiatives and their progress',
              order: 2,
              duration: 30,
              status: 'IN_PROGRESS',
            },
            {
              title: 'Market Analysis',
              description: 'Current market trends and competitive landscape analysis',
              order: 3,
              duration: 25,
              status: 'PENDING',
            },
            {
              title: 'Q1 2025 Planning',
              description: 'Strategic planning and goal setting for Q1 2025',
              order: 4,
              duration: 40,
              status: 'PENDING',
            },
          ],
        },
      },
    }),

    // Board Paper 2: Product Launch
    prisma.boardMeeting.create({
      data: {
        title: 'New Product Launch Strategy',
        description: 'Strategy and planning for the upcoming product launch',
        status: 'DRAFT',
        meetingDate: new Date('2024-12-20T14:00:00Z'),
        authorId: users[1].id,
        agendaItems: {
          create: [
            {
              title: 'Product Overview',
              description: 'Detailed overview of the new product features and benefits',
              order: 1,
              duration: 20,
              status: 'PENDING',
            },
            {
              title: 'Marketing Strategy',
              description: 'Marketing campaign strategy and budget allocation',
              order: 2,
              duration: 35,
              status: 'PENDING',
            },
            {
              title: 'Launch Timeline',
              description: 'Detailed timeline for product launch and key milestones',
              order: 3,
              duration: 25,
              status: 'PENDING',
            },
            {
              title: 'Risk Assessment',
              description: 'Potential risks and mitigation strategies',
              order: 4,
              duration: 20,
              status: 'PENDING',
            },
          ],
        },
      },
    }),

    // Board Paper 3: Budget Approval
    prisma.boardMeeting.create({
      data: {
        title: '2025 Budget Approval',
        description: 'Annual budget review and approval for 2025',
        status: 'APPROVED',
        meetingDate: new Date('2024-11-30T09:00:00Z'),
        authorId: users[2].id,
        agendaItems: {
          create: [
            {
              title: 'Budget Overview',
              description: 'Overall budget presentation and key financial highlights',
              order: 1,
              duration: 30,
              status: 'COMPLETED',
            },
            {
              title: 'Department Budgets',
              description: 'Detailed review of individual department budgets',
              order: 2,
              duration: 45,
              status: 'COMPLETED',
            },
            {
              title: 'Capital Expenditure',
              description: 'Capital expenditure plans and investment priorities',
              order: 3,
              duration: 25,
              status: 'COMPLETED',
            },
            {
              title: 'Budget Approval Vote',
              description: 'Final budget approval vote and next steps',
              order: 4,
              duration: 15,
              status: 'COMPLETED',
            },
          ],
        },
      },
    }),

    // Board Paper 4: Technology Infrastructure
    prisma.boardMeeting.create({
      data: {
        title: 'Technology Infrastructure Upgrade',
        description: 'Planning for major technology infrastructure upgrades',
        status: 'DRAFT',
        meetingDate: new Date('2025-01-10T11:00:00Z'),
        authorId: users[0].id,
        agendaItems: {
          create: [
            {
              title: 'Current Infrastructure Assessment',
              description: 'Assessment of current technology infrastructure and limitations',
              order: 1,
              duration: 35,
              status: 'PENDING',
            },
            {
              title: 'Upgrade Options',
              description: 'Available upgrade options and their cost-benefit analysis',
              order: 2,
              duration: 40,
              status: 'PENDING',
            },
            {
              title: 'Implementation Timeline',
              description: 'Proposed implementation timeline and resource requirements',
              order: 3,
              duration: 30,
              status: 'PENDING',
            },
            {
              title: 'Budget Impact',
              description: 'Financial impact and budget allocation for upgrades',
              order: 4,
              duration: 25,
              status: 'PENDING',
            },
          ],
        },
      },
    }),

    // Board Paper 5: HR Policies
    prisma.boardMeeting.create({
      data: {
        title: 'HR Policy Updates',
        description: 'Review and approval of updated HR policies and procedures',
        status: 'PUBLISHED',
        meetingDate: new Date('2024-12-10T13:00:00Z'),
        authorId: users[1].id,
        agendaItems: {
          create: [
            {
              title: 'Policy Changes Overview',
              description: 'Overview of proposed HR policy changes and rationale',
              order: 1,
              duration: 25,
              status: 'COMPLETED',
            },
            {
              title: 'Employee Benefits',
              description: 'Updates to employee benefits and compensation structure',
              order: 2,
              duration: 30,
              status: 'COMPLETED',
            },
            {
              title: 'Remote Work Policy',
              description: 'Updated remote work policy and guidelines',
              order: 3,
              duration: 20,
              status: 'COMPLETED',
            },
            {
              title: 'Implementation Plan',
              description: 'Plan for implementing new policies and communication strategy',
              order: 4,
              duration: 15,
              status: 'COMPLETED',
            },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${boardMeetings.length} board meetings with agenda items`);

  // Create additional agenda items for some board papers
  console.log('📝 Adding additional agenda items...');

  await Promise.all([
    // Add more agenda items to the first board paper
    prisma.agendaItem.createMany({
      data: [
        {
          title: 'Open Discussion',
          description: 'Open floor for additional discussion and questions',
          order: 5,
          duration: 20,
          status: 'PENDING',
          boardMeetingId: boardMeetings[0].id,
        },
        {
          title: 'Next Steps',
          description: 'Action items and next steps from the meeting',
          order: 6,
          duration: 15,
          status: 'PENDING',
          boardMeetingId: boardMeetings[0].id,
        },
      ],
    }),

    // Add more agenda items to the second board meeting
    prisma.agendaItem.createMany({
      data: [
        {
          title: 'Success Metrics',
          description: 'Key success metrics and KPIs for the product launch',
          order: 5,
          duration: 20,
          status: 'PENDING',
          boardMeetingId: boardMeetings[1].id,
        },
        {
          title: 'Resource Allocation',
          description: 'Resource allocation and team assignments for launch',
          order: 6,
          duration: 25,
          status: 'PENDING',
          boardMeetingId: boardMeetings[1].id,
        },
      ],
    }),
  ]);

  console.log('✅ Added additional agenda items');

  // Summary
  const userCount = await prisma.user.count();
  const boardMeetingCount = await prisma.boardMeeting.count();
  const agendaItemCount = await prisma.agendaItem.count();

  console.log('\n🎉 Database seeding completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   👥 Users: ${userCount}`);
  console.log(`   📋 Board Meetings: ${boardMeetingCount}`);
  console.log(`   📝 Agenda Items: ${agendaItemCount}`);
  console.log('\n🔗 Sample API endpoints to test:');
  console.log(`   GET /api/board-meetings`);
  console.log(`   GET /api/board-meetings/${boardMeetings[0].id}`);
  console.log(`   POST /api/board-meetings (with agenda items)`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 