import { notFound } from "next/navigation";
import { getAllGalleries, getGallery } from "@/lib/galleryLoader";
import GalleryComponent from "@/components/Gallery";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faYoutube } from "@fortawesome/free-brands-svg-icons";

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
        <h3 className="pt-2 text-md text-muted">{gallery.subtitle}</h3>
        {gallery.youtube && (
          <a
            href={gallery.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-accent-foreground font-semibold transition-colors"
          >
            <FontAwesomeIcon icon={faYoutube} className="w-5 h-5" />
            <span>Watch on YouTube</span>
          </a>
        )}
      </div>

      <GalleryComponent photos={gallery.photos} />
    </section>
  );
}
