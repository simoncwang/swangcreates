import Image from "next/image";
import { Gallery } from "@/lib/galleryLoader";

export default function GalleryCard({ gallery }: { gallery: Gallery }) {
  return (
    <div className="rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow bg-white">
      {gallery.photos[0] && (
        <Image
          src={gallery.photos[0].src}
          alt={gallery.title}
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
