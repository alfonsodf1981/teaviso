import Image from "next/image";
import Link from "next/link";

/** Brand row only — wrap with TopChrome for sticky chrome + category tabs. */
export function BrandHeader({
  subtitle = "Te aviso cuando baje",
  showChannels = true,
}: {
  subtitle?: string;
  showChannels?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2.5 rounded-[22px] border border-white/70 bg-white/60 px-2 py-2 shadow-clay backdrop-blur-xl">
      <Link href="/" className="flex min-w-0 items-center gap-2">
        <Image
          src="/isotipo.png"
          alt="TeAviso"
          width={40}
          height={40}
          className="drop-shadow-[0_6px_10px_rgba(255,106,61,.28)]"
        />
        <span className="flex flex-col leading-tight">
          <strong className="text-[16px] tracking-tight">TeAviso</strong>
          <span className="truncate text-[10px] font-medium text-muted">
            {subtitle}
          </span>
        </span>
      </Link>
      <div className="flex shrink-0 items-center gap-1.5">
        {showChannels && (
          <span className="whitespace-nowrap rounded-full border border-green-300/55 bg-green-100/75 px-2.5 py-1 text-[10px] font-bold text-cta-dark shadow-[0_4px_10px_rgba(22,163,74,.12)]">
            Email + Push
          </span>
        )}
        <Link
          href="/mis-alertas"
          className="grid h-9 w-9 place-items-center rounded-[14px] border border-white/80 bg-white/70 text-base shadow-soft"
          aria-label="Mis alertas"
          title="Mis alertas"
        >
          🔔
        </Link>
        <Link
          href="/cuenta"
          className="grid h-9 w-9 place-items-center rounded-[14px] border border-white/80 bg-white/70 text-base shadow-soft"
          aria-label="Cuenta"
          title="Cuenta"
        >
          👤
        </Link>
      </div>
    </div>
  );
}
