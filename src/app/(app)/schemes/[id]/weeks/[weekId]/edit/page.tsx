import { WeekFormPage } from '@/features/scheme-book/WeekFormPage';

interface PageProps {
  params: Promise<{ id: string; weekId: string }>;
}

export default async function EditSchemeWeekPage({ params }: PageProps) {
  const { id, weekId } = await params;
  return <WeekFormPage schemeId={id} weekId={weekId} />;
}
