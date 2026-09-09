import {
  createScheme,
  deleteSchemeScoped,
  findSchemeByIdScoped,
  listSchemesByAccount,
  updateSchemeScoped,
} from '@/repositories/schemeRepository';
import {
  createWeek,
  deleteWeekInScheme,
  findWeekByIdInScheme,
  listWeeksByScheme,
  updateWeekInScheme,
} from '@/repositories/schemeWeekRepository';
import { createAuditLog } from '@/repositories/auditLogRepository';
import type { CreateSchemeInput, UpdateSchemeInput, CreateSchemeWeekInput, UpdateSchemeWeekInput } from '@/validators/schemeValidators';
import type { Paginated, Scheme, SchemeWeek } from '@/types';

export async function createNewScheme(
  accountId: string,
  creatorUserId: string,
  input: CreateSchemeInput,
): Promise<Scheme> {
  return createScheme({ accountId, creatorUserId, ...input });
}

export async function listSchemes(
  accountId: string,
  page: number,
  limit: number,
): Promise<Paginated<Scheme>> {
  return listSchemesByAccount(accountId, page, limit);
}

export async function getScheme(schemeId: string, accountId: string): Promise<Scheme> {
  return findSchemeByIdScoped(schemeId, accountId);
}

export async function getSchemeWithWeeks(
  schemeId: string,
  accountId: string,
): Promise<{ scheme: Scheme; weeks: SchemeWeek[] }> {
  const scheme = await findSchemeByIdScoped(schemeId, accountId);
  const weeks = await listWeeksByScheme(schemeId);
  return { scheme, weeks };
}

export async function updateScheme(
  schemeId: string,
  accountId: string,
  input: UpdateSchemeInput,
): Promise<Scheme> {
  return updateSchemeScoped(schemeId, accountId, input);
}

export async function deleteScheme(
  schemeId: string,
  accountId: string,
  actorUserId: string,
): Promise<void> {
  await findSchemeByIdScoped(schemeId, accountId);
  await deleteSchemeScoped(schemeId, accountId);
  await createAuditLog({
    accountId,
    actorUserId,
    action: 'scheme.delete',
    entityType: 'Scheme',
    entityId: schemeId,
  });
}

export async function addSchemeWeek(
  schemeId: string,
  accountId: string,
  input: CreateSchemeWeekInput,
): Promise<SchemeWeek> {
  await findSchemeByIdScoped(schemeId, accountId);
  return createWeek({ schemeId, ...input });
}

export async function editSchemeWeek(
  schemeId: string,
  weekId: string,
  accountId: string,
  input: UpdateSchemeWeekInput,
): Promise<SchemeWeek> {
  await findSchemeByIdScoped(schemeId, accountId);
  return updateWeekInScheme(weekId, schemeId, input);
}

export async function removeSchemeWeek(
  schemeId: string,
  weekId: string,
  accountId: string,
): Promise<void> {
  await findSchemeByIdScoped(schemeId, accountId);
  await findWeekByIdInScheme(weekId, schemeId);
  await deleteWeekInScheme(weekId, schemeId);
}

export interface SchemeWeekOption {
  schemeId: string;
  weekId: string;
  klass: string;
  subject: string;
  week: number;
  topic: string;
  theme: string;
  competency: string;
}

export async function listSchemeWeekOptions(accountId: string): Promise<SchemeWeekOption[]> {
  const { items: schemes } = await listSchemesByAccount(accountId, 1, 1000);
  const options: SchemeWeekOption[] = [];
  for (const scheme of schemes) {
    const weeks = await listWeeksByScheme(scheme.id);
    for (const week of weeks) {
      options.push({
        schemeId: scheme.id,
        weekId: week.id,
        klass: scheme.klass,
        subject: scheme.subject,
        week: week.week,
        topic: week.topic,
        theme: week.theme,
        competency: week.competency,
      });
    }
  }
  return options;
}
