import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/ssr";

export default function NotFound() {
  return (
    <section className="section-shell pt-16 md:pt-28">
      <div className="content-shell reveal">
        <p className="mono-label">Error 404</p>
        <h1 className="display-heading mt-8">Page not found.</h1>
        <p className="mt-8 max-w-xl text-base leading-7 text-[var(--color-muted)] md:text-lg md:leading-8">
          The page you requested is unavailable. Return to the Wormforce home
          page to continue exploring our team.
        </p>
        <Link href="/" className="btn-primary mt-10">
          <ArrowLeftIcon size={15} aria-hidden />
          Back to home
        </Link>
      </div>
    </section>
  );
}
