import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section-shell pt-24">
      <div className="content-shell">
        <div className="card-surface reveal rounded-3xl p-8 text-center md:p-12">
          <p className="mono-label">404</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Page Not Found
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--color-muted)] md:text-base">
            The page you requested is unavailable. Return to the Wormforce home
            page to continue exploring our team.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-brand-soft)] px-5 py-2 text-sm font-medium text-[var(--color-brand)] transition hover:border-[var(--color-brand)] hover:text-white"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
