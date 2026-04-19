import Image from "next/image";
import { Gallery } from "@/lib/galleryLoader";

export default function GalleryCard({ gallery }: { gallery: Gallery }) {
  const coverPhoto = gallery.photos.find((photo) => photo.file === gallery.cover) ?? gallery.photos[0];

  return (
    <div className="rounded-xl border border-border bg-surface text-foreground shadow-sm overflow-hidden hover:bg-surface-hover hover:shadow-md transition">
      {coverPhoto && (
        <Image
          src={coverPhoto.src}
          alt={coverPhoto.alt}
          width={400}
          height={300}
          className="object-cover w-full h-48"
        />
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold">{gallery.title}</h3>
      </div>
    </div>
  );
}
