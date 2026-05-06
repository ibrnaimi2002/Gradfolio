import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-brand-600">GradFolio</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-brand-600 font-medium transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="text-sm bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            Open for students & fresh graduates
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
            Complete Tasks.
            <br />
            <span className="text-brand-600">Prove Your Skills.</span>
          </h1>

          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
            Stop applying with just a CV. Complete real-world tasks tailored to
            your major and get expert feedback on your work.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-sm"
            >
              Get Started — It&apos;s Free
            </Link>
            <Link
              href="/login"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-base font-semibold px-8 py-3.5 rounded-xl transition-colors"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Feature cards */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: '🎯',
                title: 'Tasks for your major',
                desc: 'Browse tasks curated specifically for your field and specialization.',
              },
              {
                icon: '📝',
                title: 'Submit real work',
                desc: 'Upload files, share links, or write your response — all in one place.',
              },
              {
                icon: '⭐',
                title: 'Get scored & reviewed',
                desc: 'Receive a score and written feedback from a professional reviewer.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-6"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} GradFolio. All rights reserved.
      </footer>
    </div>
  )
}
