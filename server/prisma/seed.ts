import { PrismaClient, Role, TaskStatus, Priority } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.activityLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Sarah Connor (Admin)',
      email: 'admin@vgs.com',
      password: defaultPassword,
      role: Role.ADMIN,
    },
  });

  const pm1 = await prisma.user.create({
    data: {
      name: 'Alex Morgan',
      email: 'alex.pm@vgs.com',
      password: defaultPassword,
      role: Role.PROJECT_MANAGER,
    },
  });

  const pm2 = await prisma.user.create({
    data: {
      name: 'David Chen',
      email: 'david.pm@vgs.com',
      password: defaultPassword,
      role: Role.PROJECT_MANAGER,
    },
  });

  const dev1 = await prisma.user.create({
    data: {
      name: 'Ravi Patel',
      email: 'ravi.dev@vgs.com',
      password: defaultPassword,
      role: Role.DEVELOPER,
    },
  });

  const dev2 = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'elena.dev@vgs.com',
      password: defaultPassword,
      role: Role.DEVELOPER,
    },
  });

  const dev3 = await prisma.user.create({
    data: {
      name: 'Marcus Johnson',
      email: 'marcus.dev@vgs.com',
      password: defaultPassword,
      role: Role.DEVELOPER,
    },
  });

  const dev4 = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'priya.dev@vgs.com',
      password: defaultPassword,
      role: Role.DEVELOPER,
    },
  });

  const project1 = await prisma.project.create({
    data: {
      name: 'Apex Banking Mobile App',
      client: 'Apex Financial Group',
      managerId: pm1.id,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'PulseCare Telehealth Suite',
      client: 'Pulse Health Systems',
      managerId: pm2.id,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'OmniFlow Logistics Engine',
      client: 'Global Freight Corp',
      managerId: pm1.id,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
  });

  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  const t1 = await prisma.task.create({
    data: {
      title: 'Implement Biometric Authentication & FaceID',
      description: 'Integrate WebAuthn and React Native Keychain for hardware-level auth.',
      status: TaskStatus.IN_REVIEW,
      priority: Priority.CRITICAL,
      dueDate: new Date(now + 2 * DAY_MS),
      isOverdue: false,
      projectId: project1.id,
      developerId: dev1.id,
      createdAt: new Date(now - 7 * DAY_MS),
    },
  });

  const t2 = await prisma.task.create({
    data: {
      title: 'Plaid Bank Account Linking Pipeline',
      description: 'Exchange public token for access token and securely store in Vault.',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      dueDate: new Date(now - 3 * DAY_MS),
      isOverdue: true,
      projectId: project1.id,
      developerId: dev1.id,
      createdAt: new Date(now - 10 * DAY_MS),
    },
  });

  const t3 = await prisma.task.create({
    data: {
      title: 'PCI-DSS Compliance Audit & Encryption at Rest',
      description: 'Verify AES-256 GCM encryption on all cardholder sensitive data tables.',
      status: TaskStatus.TODO,
      priority: Priority.CRITICAL,
      dueDate: new Date(now + 5 * DAY_MS),
      isOverdue: false,
      projectId: project1.id,
      developerId: dev2.id,
      createdAt: new Date(now - 4 * DAY_MS),
    },
  });

  const t4 = await prisma.task.create({
    data: {
      title: 'Automated Wire Transfer Reconciliation Cron',
      description: 'Nightly batch settlement matching with SWIFT MT940 statement feed.',
      status: TaskStatus.DONE,
      priority: Priority.MEDIUM,
      dueDate: new Date(now - 2 * DAY_MS),
      isOverdue: false,
      projectId: project1.id,
      developerId: dev3.id,
      createdAt: new Date(now - 14 * DAY_MS),
    },
  });

  const t5 = await prisma.task.create({
    data: {
      title: 'Push Notification Alerts for Large Withdrawals',
      description: 'Trigger high-priority WebSocket and APNS alerts for debits > $5,000.',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.MEDIUM,
      dueDate: new Date(now + 4 * DAY_MS),
      isOverdue: false,
      projectId: project1.id,
      developerId: dev4.id,
      createdAt: new Date(now - 3 * DAY_MS),
    },
  });

  const t6 = await prisma.task.create({
    data: {
      title: 'Export Monthly Statement PDF Generation',
      description: 'Stream HTML-to-PDF generation through serverless worker.',
      status: TaskStatus.TODO,
      priority: Priority.LOW,
      dueDate: new Date(now + 10 * DAY_MS),
      isOverdue: false,
      projectId: project1.id,
      developerId: dev1.id,
      createdAt: new Date(now - 2 * DAY_MS),
    },
  });

  const t7 = await prisma.task.create({
    data: {
      title: 'WebRTC Video Consultation Room with End-to-End Encryption',
      description: 'Zero-knowledge signaling server with mesh fallback and recording consent.',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.CRITICAL,
      dueDate: new Date(now + 1 * DAY_MS),
      isOverdue: false,
      projectId: project2.id,
      developerId: dev2.id,
      createdAt: new Date(now - 6 * DAY_MS),
    },
  });

  const t8 = await prisma.task.create({
    data: {
      title: 'HIPAA-Compliant Patient EHR Sync (HL7 / FHIR API)',
      description: 'Transform Epic/Cerner JSON resources to internal clinical patient schema.',
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      dueDate: new Date(now - 4 * DAY_MS),
      isOverdue: true,
      projectId: project2.id,
      developerId: dev3.id,
      createdAt: new Date(now - 12 * DAY_MS),
    },
  });

  const t9 = await prisma.task.create({
    data: {
      title: 'Doctor Prescription Dispatch to Pharmacies',
      description: 'Connect with Surescripts API for digital prescription transmission.',
      status: TaskStatus.IN_REVIEW,
      priority: Priority.HIGH,
      dueDate: new Date(now + 3 * DAY_MS),
      isOverdue: false,
      projectId: project2.id,
      developerId: dev4.id,
      createdAt: new Date(now - 5 * DAY_MS),
    },
  });

  const t10 = await prisma.task.create({
    data: {
      title: 'Patient Symptom Checker AI Integration',
      description: 'Triage questionnaire chatbot routing patients to appropriate specialty.',
      status: TaskStatus.DONE,
      priority: Priority.MEDIUM,
      dueDate: new Date(now - 1 * DAY_MS),
      isOverdue: false,
      projectId: project2.id,
      developerId: dev2.id,
      createdAt: new Date(now - 15 * DAY_MS),
    },
  });

  const t11 = await prisma.task.create({
    data: {
      title: 'Stripe Co-Pay & Insurance Billing Flow',
      description: 'Pre-authorize deductible and execute charge on session completion.',
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      dueDate: new Date(now + 7 * DAY_MS),
      isOverdue: false,
      projectId: project2.id,
      developerId: dev3.id,
      createdAt: new Date(now - 2 * DAY_MS),
    },
  });

  const t12 = await prisma.task.create({
    data: {
      title: 'Fleet GPS Telemetry Stream Ingestion',
      description: 'Process 10,000 pings/sec from OBD-II vehicle tracking devices via MQTT.',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.CRITICAL,
      dueDate: new Date(now + 3 * DAY_MS),
      isOverdue: false,
      projectId: project3.id,
      developerId: dev1.id,
      createdAt: new Date(now - 8 * DAY_MS),
    },
  });

  const t13 = await prisma.task.create({
    data: {
      title: 'Dynamic Route Optimization with Weather Overlays',
      description: 'Calculate fuel-optimal path using Dijkstra algorithm with NOAA storms.',
      status: TaskStatus.IN_REVIEW,
      priority: Priority.HIGH,
      dueDate: new Date(now + 2 * DAY_MS),
      isOverdue: false,
      projectId: project3.id,
      developerId: dev4.id,
      createdAt: new Date(now - 9 * DAY_MS),
    },
  });

  const t14 = await prisma.task.create({
    data: {
      title: 'Driver Hours-of-Service (HOS) ELD Compliance Flagging',
      description: 'Auto-detect driving violations beyond FMCSA 11-hour limit.',
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      dueDate: new Date(now - 2 * DAY_MS),
      isOverdue: true,
      projectId: project3.id,
      developerId: dev2.id,
      createdAt: new Date(now - 8 * DAY_MS),
    },
  });

  const t15 = await prisma.task.create({
    data: {
      title: 'Automated Bill of Lading (BOL) OCR Scanner',
      description: 'Extract freight cargo codes and weights from scanned driver slips.',
      status: TaskStatus.DONE,
      priority: Priority.MEDIUM,
      dueDate: new Date(now - 5 * DAY_MS),
      isOverdue: false,
      projectId: project3.id,
      developerId: dev3.id,
      createdAt: new Date(now - 18 * DAY_MS),
    },
  });

  const t16 = await prisma.task.create({
    data: {
      title: 'Geofence Arrival & Departure Webhooks',
      description: 'Send customer SMS notifications when cargo arrives within 5km radius.',
      status: TaskStatus.TODO,
      priority: Priority.LOW,
      dueDate: new Date(now + 9 * DAY_MS),
      isOverdue: false,
      projectId: project3.id,
      developerId: dev1.id,
      createdAt: new Date(now - 1 * DAY_MS),
    },
  });

  const logsData = [
    {
      action: 'moved Task "Biometric Authentication" from IN_PROGRESS â†’ IN_REVIEW',
      taskId: t1.id,
      userId: dev1.id,
      createdAt: new Date(now - 15 * 60 * 1000),
    },
    {
      action: 'moved Task "Doctor Prescription Dispatch" from TODO â†’ IN_REVIEW',
      taskId: t9.id,
      userId: dev4.id,
      createdAt: new Date(now - 45 * 60 * 1000),
    },
    {
      action: 'moved Task "Fleet GPS Telemetry Stream" from TODO â†’ IN_PROGRESS',
      taskId: t12.id,
      userId: dev1.id,
      createdAt: new Date(now - 2 * 60 * 60 * 1000),
    },
    {
      action: 'moved Task "Dynamic Route Optimization" from IN_PROGRESS â†’ IN_REVIEW',
      taskId: t13.id,
      userId: dev4.id,
      createdAt: new Date(now - 3 * 60 * 60 * 1000),
    },
    {
      action: 'moved Task "Wire Transfer Reconciliation Cron" from IN_REVIEW â†’ DONE',
      taskId: t4.id,
      userId: pm1.id,
      createdAt: new Date(now - 5 * 60 * 60 * 1000),
    },
    {
      action: 'moved Task "Patient Symptom Checker AI" from IN_REVIEW â†’ DONE',
      taskId: t10.id,
      userId: pm2.id,
      createdAt: new Date(now - 8 * 60 * 60 * 1000),
    },
    {
      action: 'moved Task "Automated Bill of Lading (BOL)" from IN_PROGRESS â†’ DONE',
      taskId: t15.id,
      userId: dev3.id,
      createdAt: new Date(now - 12 * 60 * 60 * 1000),
    },
    {
      action: 'created Task "Plaid Bank Account Linking Pipeline"',
      taskId: t2.id,
      userId: pm1.id,
      createdAt: new Date(now - 24 * 60 * 60 * 1000),
    },
    {
      action: 'moved Task "WebRTC Video Consultation Room" from TODO â†’ IN_PROGRESS',
      taskId: t7.id,
      userId: dev2.id,
      createdAt: new Date(now - 28 * 60 * 60 * 1000),
    },
    {
      action: 'created Task "Driver Hours-of-Service Compliance"',
      taskId: t14.id,
      userId: pm1.id,
      createdAt: new Date(now - 36 * 60 * 60 * 1000),
    },
  ];

  for (const log of logsData) {
    await prisma.activityLog.create({ data: log });
  }

  const notificationsData = [
    {
      message: 'You have been assigned a new task: "Implement Biometric Authentication & FaceID"',
      userId: dev1.id,
      taskId: t1.id,
      isRead: false,
      createdAt: new Date(now - 30 * 60 * 1000),
    },
    {
      message: 'Task "Implement Biometric Authentication & FaceID" was moved to IN_REVIEW by Ravi Patel',
      userId: pm1.id,
      taskId: t1.id,
      isRead: false,
      createdAt: new Date(now - 15 * 60 * 1000),
    },
    {
      message: 'Task "Dynamic Route Optimization" was moved to IN_REVIEW by Priya Sharma',
      userId: pm1.id,
      taskId: t13.id,
      isRead: false,
      createdAt: new Date(now - 3 * 60 * 60 * 1000),
    },
    {
      message: 'You have been assigned a new task: "WebRTC Video Consultation Room"',
      userId: dev2.id,
      taskId: t7.id,
      isRead: false,
      createdAt: new Date(now - 2 * DAY_MS),
    },
    {
      message: 'Task "Doctor Prescription Dispatch" was moved to IN_REVIEW by Priya Sharma',
      userId: pm2.id,
      taskId: t9.id,
      isRead: false,
      createdAt: new Date(now - 45 * 60 * 1000),
    },
    {
      message: 'You have been assigned a new task: "Fleet GPS Telemetry Stream Ingestion"',
      userId: dev1.id,
      taskId: t12.id,
      isRead: true,
      createdAt: new Date(now - 3 * DAY_MS),
    },
  ];

  for (const notif of notificationsData) {
    await prisma.notification.create({ data: notif });
  }

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

