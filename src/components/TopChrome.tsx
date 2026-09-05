import { Suspense } from "react";
import { BrandHeader } from "@/components/BrandHeader";
import { CategoryTabs } from "@/components/CategoryTabs";

/** Sticky top: brand row + category tabs (icon + underline). */
export function TopChrome({
  subtitle,
  showChannels = true,
  showTabs = true,
}: {
  subtitle?: string;
  showChannels?: boolean;
  showTabs?: boolean;
}) {
  return (
    <div className="sticky top-0 z-40 px-3 pb-2 pt-3 bg-gradient-to-b from-page/95 via-page/80 to-transparent backdrop-blur-md">
      <BrandHeader subtitle={subtitle} showChannels={showChannels} />
      {showTabs && (
        <Suspense fallback={<div className="mt-1.5 h-14" />}>
          <CategoryTabs />
        </Suspense>
      )}
    </div>
  );
}
