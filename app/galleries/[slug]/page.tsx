import { notFound } from "next/navigation";
import { getAllGalleries, getGallery } from "@/lib/galleryLoader";
import GalleryComponent from "@/components/Gallery";

export async function generateStaticParams() {
  return getAllGalleries().map((g) => ({ slug: g.slug }));
}

export default async function GalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const gallery = getGallery(slug);

  if (!gallery) return notFound();

  return (
    <section className="space-y-8">
      <div className="pt-4">
        <h2 className="text-3xl font-bold">{gallery.title}</h2>
        <h3 className="pt-2 text-md text-gray-500">{gallery.subtitle}</h3>
      </div>

      <GalleryComponent photos={gallery.photos} />
    </section>
  );
}
