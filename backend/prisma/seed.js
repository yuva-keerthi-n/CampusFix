const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const DEMO_PASSWORD = 'Demo@123';

const CATEGORIES = ['Electrical', 'Plumbing', 'Internet / Wi-Fi', 'Classroom', 'Laboratory', 'Furniture', 'Cleanliness', 'Washroom', 'Security', 'Other'];
const LOCATIONS = ['Main Block', 'CSE Block', 'ECE Block', 'Mechanical Block', 'Library', 'Laboratory', 'Auditorium', 'Cafeteria', 'Hostel', 'Sports Ground', 'Parking Area', 'Washroom', 'Other'];

async function main() {
  console.log('Seeding database...');
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@campusfix.edu' },
    update: {},
    create: { name: 'Campus Admin', email: 'admin@campusfix.edu', passwordHash, role: 'admin' },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@campusfix.edu' },
    update: {},
    create: { name: 'Maintenance Staff', email: 'staff@campusfix.edu', passwordHash, role: 'staff' },
  });

  const students = [];
  for (const [i, name] of ['Asha Rao', 'Ravi Kumar', 'Priya Nair'].entries()) {
    const student = await prisma.user.upsert({
      where: { email: `student${i + 1}@campusfix.edu` },
      update: {},
      create: { name, email: `student${i + 1}@campusfix.edu`, passwordHash, role: 'student' },
    });
    students.push(student);
  }

  for (const name of CATEGORIES) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }
  for (const name of LOCATIONS) {
    await prisma.location.upsert({ where: { name }, update: {}, create: { name } });
  }

  const categories = await prisma.category.findMany();
  const locations = await prisma.location.findMany();
  const catByName = Object.fromEntries(categories.map((c) => [c.name, c.id]));
  const locByName = Object.fromEntries(locations.map((l) => [l.name, l.id]));

  const sampleComplaints = [
    { title: 'Broken ceiling fan', category: 'Electrical', location: 'CSE Block', priority: 'High', status: 'Reported' },
    { title: 'Flickering tube light', category: 'Electrical', location: 'Main Block', priority: 'Medium', status: 'Under_Review' },
    { title: 'Water leakage near stairs', category: 'Plumbing', location: 'Hostel', priority: 'Critical', status: 'Assigned', assign: true },
    { title: 'Wi-Fi not working in lab', category: 'Internet / Wi-Fi', location: 'Laboratory', priority: 'High', status: 'In_Progress', assign: true },
    { title: 'Broken chair backrest', category: 'Furniture', location: 'ECE Block', priority: 'Low', status: 'In_Progress', assign: true },
    { title: 'Washroom tap not closing', category: 'Washroom', location: 'Washroom', priority: 'Medium', status: 'Resolved', assign: true, resolve: true },
    { title: 'Projector not turning on', category: 'Classroom', location: 'Main Block', priority: 'High', status: 'Resolved', assign: true, resolve: true },
    { title: 'Garbage not cleared', category: 'Cleanliness', location: 'Cafeteria', priority: 'Medium', status: 'Rejected' },
    { title: 'Damaged lab equipment', category: 'Laboratory', location: 'Laboratory', priority: 'Critical', status: 'Reported' },
    { title: 'Broken window latch', category: 'Other', location: 'Mechanical Block', priority: 'Low', status: 'Under_Review' },
    { title: 'Parking area pothole', category: 'Other', location: 'Parking Area', priority: 'Medium', status: 'Assigned', assign: true },
    { title: 'Auditorium mic not working', category: 'Electrical', location: 'Auditorium', priority: 'High', status: 'Resolved', assign: true, resolve: true },
  ];

  let year = new Date().getFullYear();
  let counter = 1;

  for (const c of sampleComplaints) {
    const reporter = students[counter % students.length];
    const complaintCode = `CF-${year}-${String(counter).padStart(4, '0')}`;
    counter += 1;

    const complaint = await prisma.complaint.create({
      data: {
        complaintCode,
        title: c.title,
        description: `${c.title} — reported for demo purposes. Needs attention from maintenance staff.`,
        categoryId: catByName[c.category],
        locationId: locByName[c.location],
        priority: c.priority,
        status: c.status,
        reportedBy: reporter.id,
        assignedTo: c.assign ? staff.id : null,
        resolvedAt: c.resolve ? new Date() : null,
      },
    });

    await prisma.complaintHistory.create({
      data: { complaintId: complaint.id, status: 'Reported', changedBy: reporter.id, note: 'Complaint submitted.' },
    });
    if (c.assign) {
      await prisma.complaintHistory.create({
        data: { complaintId: complaint.id, status: 'Assigned', changedBy: admin.id, note: `Assigned to ${staff.name}.` },
      });
    }
    if (c.resolve) {
      await prisma.complaintHistory.create({
        data: { complaintId: complaint.id, status: 'Resolved', changedBy: staff.id, note: 'Issue fixed and verified.' },
      });
      await prisma.resolution.create({
        data: { complaintId: complaint.id, resolvedBy: staff.id, notes: 'Fixed and tested — working as expected.' },
      });
    }

    await prisma.notification.create({
      data: {
        userId: reporter.id,
        complaintId: complaint.id,
        message: `Your complaint ${complaint.complaintCode} is currently "${c.status.split("_").join(" ")}".`,
      },
    });
  }

  console.log('Seed complete.');
  console.log('Demo logins (password for all: Demo@123):');
  console.log('  Admin:   admin@campusfix.edu');
  console.log('  Staff:   staff@campusfix.edu');
  console.log('  Student: student1@campusfix.edu / student2@campusfix.edu / student3@campusfix.edu');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


