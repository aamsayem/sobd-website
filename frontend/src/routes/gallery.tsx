import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/page-hero";
import { getPublicGallery } from "@/lib/public-content.functions";
import { Loader2 } from "lucide-react";

import imgRelief from "@/assets/Activities — Relief.png";
import imgEdu from "@/assets/Activities — Education.png";
import imgFood from "@/assets/Activities — Food.png";
import imgMedical from "@/assets/Activities — Medical.png";
import imgWinter from "@/assets/Activities — Winter.png";
import imgSokkhom from "@/assets/sokkhom-hero.png";

type GalleryItem = {
  id: string;
  image_url: string;
  title?: string | null;
  caption?: string | null;
};

const fallback: GalleryItem[] = [
  imgRelief,
  imgEdu,
  imgFood,
  imgMedical,
  imgWinter,
  imgSokkhom,
  imgEdu,
  imgRelief,
].map((src, i) => ({
  id: `fb-${i}`,
  image_url: src,
  title: null,
  caption: null,
}));

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [{ title: "Gallery — SELFLESS ORGANIZATION BD" }] }),
  component: Gallery,
});

function Gallery() {
  const fn = getPublicGallery;
  const { data, isLoading } = useQuery({ queryKey: ["public-gallery"], queryFn: () => fn() });
  const items = ((data && data.length > 0 ? data : fallback) as GalleryItem[]) ?? fallback;

  return (
    <>
      <PageHero kicker="MOMENTS" title="Photo Gallery" bn="আমাদের কাজের মুহূর্ত" />
      <section className="container mx-auto px-4 py-16">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
          </div>
        ) : (
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {items.map((it) => (
              <figure key={it.id} className="break-inside-avoid">
                <img
                  src={it.image_url}
                  alt={it.title ?? ""}
                  loading="lazy"
                  className="w-full rounded-2xl shadow-soft hover:scale-[1.02] transition-transform"
                />
                {(it.title || it.caption) && (
                  <figcaption className="mt-2 px-1">
                    {it.title && (
                      <div className="text-sm font-semibold text-emerald-950">{it.title}</div>
                    )}
                    {it.caption && <div className="text-xs text-emerald-800/80">{it.caption}</div>}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
