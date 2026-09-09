import { SchemeEditor } from '@/features/scheme-book/SchemeEditor';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SchemeDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <SchemeEditor schemeId={id} />;
}
