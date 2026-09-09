/**
 * Seed script — creates one school account (with a super admin, two starter
 * roles, and one invited staff member) and one private teacher account (with
 * a scheme book and a lesson plan) for local development.
 *
 * Usage: npm run seed
 */
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { connectDB } from '../src/lib/db';
import AccountModel from '../src/models/Account';
import UserModel from '../src/models/User';
import RoleModel from '../src/models/Role';
import SchemeModel from '../src/models/Scheme';
import SchemeWeekModel from '../src/models/SchemeWeek';
import LessonModel from '../src/models/Lesson';
import AuditLogModel from '../src/models/AuditLog';
import InviteTokenModel from '../src/models/InviteToken';
import PasswordResetTokenModel from '../src/models/PasswordResetToken';

import { registerAccount } from '../src/services/authService';
import { sendStaffInvite } from '../src/services/inviteService';
import { listRoles } from '../src/services/roleService';
import { createNewScheme, addSchemeWeek } from '../src/services/schemeService';
import { createNewLesson } from '../src/services/lessonService';

const SCHOOL_ADMIN_EMAIL = 'admin@riverside.example';
const SCHOOL_ADMIN_PASSWORD = 'SchoolAdmin123!';
const INVITED_TEACHER_EMAIL = 'teacher@riverside.example';

const PRIVATE_TEACHER_EMAIL = 'teacher@example.com';
const PRIVATE_TEACHER_PASSWORD = 'PrivateTeacher123!';

async function resetDatabase() {
  await Promise.all([
    AccountModel.deleteMany({}),
    UserModel.deleteMany({}),
    RoleModel.deleteMany({}),
    SchemeModel.deleteMany({}),
    SchemeWeekModel.deleteMany({}),
    LessonModel.deleteMany({}),
    AuditLogModel.deleteMany({}),
    InviteTokenModel.deleteMany({}),
    PasswordResetTokenModel.deleteMany({}),
  ]);
}

async function seedSchoolAccount() {
  const { account } = await registerAccount({
    type: 'school',
    schoolName: 'Riverside Academy',
    displayName: 'Alex Superadmin',
    email: SCHOOL_ADMIN_EMAIL,
    password: SCHOOL_ADMIN_PASSWORD,
  });

  const roles = await listRoles(account.id);
  const teacherRole = roles.find((role) => role.name === 'Teacher');
  if (!teacherRole) throw new Error('Teacher role was not seeded as expected');

  await sendStaffInvite(account.id, INVITED_TEACHER_EMAIL, teacherRole.id);

  console.log(`School account: "${account.name}"`);
  console.log(`  Super admin login: ${SCHOOL_ADMIN_EMAIL} / ${SCHOOL_ADMIN_PASSWORD}`);
  console.log(`  Invited staff:     ${INVITED_TEACHER_EMAIL} (invite link logged above)`);
  console.log(`  Roles seeded:      ${roles.map((r) => r.name).join(', ')}`);
}

async function seedPrivateTeacherAccount() {
  const { user, account } = await registerAccount({
    type: 'individual',
    name: 'Jordan Teacher',
    email: PRIVATE_TEACHER_EMAIL,
    password: PRIVATE_TEACHER_PASSWORD,
  });

  const scheme = await createNewScheme(account.id, user.id, {
    klass: 'Grade 6',
    subject: 'Science',
    term: 'Term 1',
    year: new Date().getFullYear(),
  });

  const weeks = [
    {
      week: 1,
      theme: 'Living Things',
      topic: 'Classification of animals',
      competency: 'Learners can classify animals into vertebrates and invertebrates.',
      teacherActivities: 'Guide discussion; present chart of animal groups.',
      learnerActivities: 'Sort animal pictures into groups; discuss in pairs.',
      materials: 'Animal picture cards, classification chart.',
      assessment: 'Oral questioning and group sorting exercise.',
      remarks: '',
    },
    {
      week: 2,
      theme: 'Living Things',
      topic: 'Life cycle of a butterfly',
      competency: 'Learners can sequence the stages of a butterfly life cycle.',
      teacherActivities: 'Show life cycle diagram; explain each stage.',
      learnerActivities: 'Draw and label the four stages of the life cycle.',
      materials: 'Life cycle diagram, drawing sheets.',
      assessment: 'Labelled diagram checked for accuracy.',
      remarks: '',
    },
    {
      week: 3,
      theme: 'Living Things',
      topic: 'Plant growth and needs',
      competency: 'Learners can identify what plants need to grow.',
      teacherActivities: 'Set up a simple germination demonstration.',
      learnerActivities: 'Record daily observations of seed germination.',
      materials: 'Seeds, soil, cups, water, observation journal.',
      assessment: 'Observation journal review.',
      remarks: '',
    },
  ];

  for (const week of weeks) {
    await addSchemeWeek(scheme.id, account.id, week);
  }

  const lesson = await createNewLesson(account.id, user.id, {
    date: new Date().toISOString().slice(0, 10),
    klass: scheme.klass,
    subject: scheme.subject,
    theme: weeks[0].theme,
    topic: weeks[0].topic,
    duration: '40 minutes',
    numLearners: 28,
    competency: weeks[0].competency,
    introduction: 'Recap what learners already know about animals.',
    teacherActivities: weeks[0].teacherActivities,
    learnerActivities: weeks[0].learnerActivities,
    materials: weeks[0].materials,
    assessment: weeks[0].assessment,
    conclusion: 'Summarize the two main animal groups with the class.',
    reflection: '',
    schemeId: scheme.id,
    schemeWeekId: null,
  });

  console.log(`Private teacher account: "${account.name}"`);
  console.log(`  Login: ${PRIVATE_TEACHER_EMAIL} / ${PRIVATE_TEACHER_PASSWORD}`);
  console.log(`  Scheme book: ${scheme.klass} ${scheme.subject} (${weeks.length} weeks)`);
  console.log(`  Lesson plan: ${lesson.topic}`);
}

async function main() {
  await connectDB();
  await resetDatabase();
  await seedSchoolAccount();
  await seedPrivateTeacherAccount();
  console.log('\nSeed complete.');
  process.exit(0);
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
