import { LessonEditor } from '@/features/lesson-plan/LessonEditor';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LessonDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <LessonEditor lessonId={id} />;
}
