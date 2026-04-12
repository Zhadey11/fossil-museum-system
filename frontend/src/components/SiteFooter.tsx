import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="sw-footer">
      <Link href="/" className="foot-logo">
        <span className="foot-logo-name">
          <b>Stone</b>Wake
        </span>
        <span className="foot-logo-sub">Museum</span>
      </Link>
      <p className="foot-tagline">«Donde el mundo antiguo despierta.»</p>
      <p className="foot-copy">
        © {new Date().getFullYear()} Stonewake · Est. 1987
      </p>
    </footer>
  );
}
