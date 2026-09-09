import { WeekDetailPage } from '@/features/scheme-book/WeekDetailPage';

interface PageProps {
  params: Promise<{ id: string; weekId: string }>;
}

export default async function SchemeWeekDetailPage({ params }: PageProps) {
  const { id, weekId } = await params;
  return <WeekDetailPage schemeId={id} weekId={weekId} />;
}
