import Link from "next/link";
import { getAllGalleries } from "@/lib/galleryLoader";
import GalleryCard from "@/components/GalleryCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faYoutube } from "@fortawesome/free-brands-svg-icons";

export default function HomePage() {
  const galleries = getAllGalleries();

  return (
    <section className="space-y-12">
      
        <div className="text-center">
          <a
          href={"https://www.youtube.com/@swangcreates"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-accent-foreground font-semibold transition-colors"
        >
          <FontAwesomeIcon icon={faYoutube} className="w-5 h-5" />
          <span>Check out my YouTube!</span>
        </a>

        <hr className="my-8 border-border" />

        <h2 className="text-3xl font-bold">my photography.</h2>
        <p className="mt-4 text-md">click a gallery to explore~</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {galleries.map((gallery) => (
          <Link key={gallery.slug} href={`/galleries/${gallery.slug}`}>
            <GalleryCard gallery={gallery} />
          </Link>
        ))}
      </div>

      <hr className="my-8 border-border" />
    </section>
  );
}
