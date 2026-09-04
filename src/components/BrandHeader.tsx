import Image from "next/image";
import Link from "next/link";

export function BrandHeader({
  subtitle = "Te aviso cuando baje",
  showChannels = true,
}: {
  subtitle?: string;
  showChannels?: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 px-3 pb-2 pt-3">
      <div className="flex items-center justify-between gap-2.5 rounded-[22px] border border-white/70 bg-white/60 px-2 py-2 shadow-clay backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/isotipo.png"
            alt="TeAviso"
            width={40}
            height={40}
            className="drop-shadow-[0_6px_10px_rgba(255,106,61,.28)]"
          />
          <span className="flex flex-col leading-tight">
            <strong className="text-[16px] tracking-tight">TeAviso</strong>
            <span className="text-[10px] font-medium text-muted">{subtitle}</span>
          </span>
        </Link>
        {showChannels && (
          <span className="whitespace-nowrap rounded-full border border-green-300/55 bg-green-100/75 px-2.5 py-1 text-[10px] font-bold text-cta-dark shadow-[0_4px_10px_rgba(22,163,74,.12)]">
            Email + Push
          </span>
        )}
      </div>
    </header>
  );
}
