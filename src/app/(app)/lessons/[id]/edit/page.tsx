import { LessonFormPage } from '@/features/lesson-plan/LessonFormPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLessonPage({ params }: PageProps) {
  const { id } = await params;
  return <LessonFormPage lessonId={id} />;
}
