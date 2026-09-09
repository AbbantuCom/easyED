import Link from 'next/link';

const FEATURES = [
  {
    title: 'Scheme books, organized by term',
    description:
      'Lay out your whole term week by week — theme, topic, competency, activities, materials, and assessment — in one structured book.',
  },
  {
    title: 'Lesson plans that build on your scheme',
    description:
      'Pull a week straight from your scheme book to start a lesson plan, then expand it with your introduction, activities, and reflection.',
  },
  {
    title: 'Built for schools, too',
    description:
      'Invite your staff, assign roles, and let your academic head prepare scheme books centrally while teachers build lesson plans against them.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="text-lg font-bold text-slate-900">easyEd</span>
          <nav className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Lesson planning, without the paperwork
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            easyEd gives teachers a simple place to build scheme books and lesson plans — and
            gives schools a shared, organized way to prepare and review them together.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:w-auto"
            >
              Create your free account
            </Link>
            <Link
              href="/sign-in"
              className="w-full rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:w-auto"
            >
              Sign in
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-base font-semibold text-slate-900">{feature.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <p className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-500 sm:px-6">
          &copy; {new Date().getFullYear()} easyEd. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
