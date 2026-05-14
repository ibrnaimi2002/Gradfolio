import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">G</span>
            </div>
            <span className="text-base font-bold text-gray-900">
              Grad<span className="text-brand-600">Folio</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-brand-600 font-medium transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="text-sm bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white pt-20 pb-24">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-32 w-[500px] h-[500px] rounded-full bg-brand-100 opacity-60 blur-3xl" />
            <div className="absolute top-24 -left-24 w-72 h-72 rounded-full bg-purple-100 opacity-40 blur-2xl" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-t from-white to-transparent" />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white text-brand-700 text-xs font-semibold px-4 py-2 rounded-full mb-8 border border-brand-200 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              Open for students &amp; fresh graduates
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.08] mb-6">
              Complete Tasks.
              <br />
              <span className="text-brand-600">Prove Your Skills.</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Stop applying with just a CV. Complete real-world tasks tailored to your major,
              get expert feedback, and build a portfolio that actually speaks for itself.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-8 py-4 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Get Started — It&apos;s Free
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 text-base font-semibold px-8 py-4 rounded-xl transition-all border border-gray-200 hover:border-gray-300"
              >
                Sign In →
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-10 text-center">
              {[
                { value: '3', label: 'Fields covered' },
                { value: '16+', label: 'Real-world tasks' },
                { value: '100', label: 'Max score' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-3xl font-extrabold text-brand-600">{value}</p>
                  <p className="text-sm text-gray-400 mt-1 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How it works</h2>
              <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
                Three steps to turn your education into a proof of real skill.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  step: '01',
                  icon: '🎯',
                  title: 'Pick your field & major',
                  desc: 'Tell us your specialization — IT, Business, or Design — and we surface tasks built specifically for you.',
                  color: 'from-blue-50 to-brand-50 border-brand-100',
                },
                {
                  step: '02',
                  icon: '📝',
                  title: 'Submit real work',
                  desc: 'Upload files, paste links, or write your answer. Every task mirrors a real workplace scenario.',
                  color: 'from-purple-50 to-pink-50 border-purple-100',
                },
                {
                  step: '03',
                  icon: '⭐',
                  title: 'Get scored & reviewed',
                  desc: 'Receive a score and written feedback from a reviewer. Your portfolio grows with every task.',
                  color: 'from-emerald-50 to-teal-50 border-emerald-100',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className={`bg-gradient-to-br ${item.color} rounded-2xl p-8 border`}
                >
                  <div className="text-xs font-bold text-gray-400 mb-4 tracking-widest uppercase">
                    Step {item.step}
                  </div>
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg leading-snug">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features row */}
        <section className="py-20 bg-gray-50 border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
              {[
                { icon: '🏆', label: 'Achievement badges', sub: 'Earn as you grow' },
                { icon: '📊', label: 'Score tracking', sub: 'See your progress' },
                { icon: '🗂️', label: 'Portfolio page', sub: 'Share your work' },
                { icon: '🔒', label: 'Expert review', sub: 'Real feedback' },
              ].map((f) => (
                <div key={f.label} className="flex flex-col items-center gap-2">
                  <div className="text-3xl">{f.icon}</div>
                  <p className="font-semibold text-gray-800 text-sm">{f.label}</p>
                  <p className="text-xs text-gray-400">{f.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA banner */}
        <section className="py-24">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-12 shadow-xl">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to build your portfolio?
              </h2>
              <p className="text-brand-200 mb-8 text-lg leading-relaxed">
                Join students who are proving their skills through work, not just grades.
              </p>
              <Link
                href="/login"
                className="inline-block bg-white hover:bg-gray-50 text-brand-700 font-bold px-10 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Get Started — It&apos;s Free
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <span className="text-white text-xs font-bold">G</span>
          </div>
          <span className="text-sm font-bold text-gray-700">GradFolio</span>
        </div>
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} GradFolio. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
