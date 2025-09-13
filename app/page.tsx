import Link from "next/link";
import { getAllGalleries } from "@/lib/galleryLoader";
import GalleryCard from "@/components/GalleryCard";

export default function HomePage() {
  const galleries = getAllGalleries();

  return (
    <section className="space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold">my photography</h2>
        <p className="mt-4 text-md">click a gallery to explore~</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {galleries.map((gallery) => (
          <Link key={gallery.slug} href={`/galleries/${gallery.slug}`}>
            <GalleryCard gallery={gallery} />
          </Link>
        ))}
      </div>
    </section>
  );
}
