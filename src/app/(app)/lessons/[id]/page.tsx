import { LessonDetailPage } from '@/features/lesson-plan/LessonDetailPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LessonDetailRoute({ params }: PageProps) {
  const { id } = await params;
  return <LessonDetailPage lessonId={id} />;
}
