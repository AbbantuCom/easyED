import { WeekFormPage } from '@/features/scheme-book/WeekFormPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NewSchemeWeekPage({ params }: PageProps) {
  const { id } = await params;
  return <WeekFormPage schemeId={id} />;
}
