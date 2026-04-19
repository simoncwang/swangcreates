import fs from "fs";
import path from "path";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export type Photo = {
  file: string;
  src: string;
  alt: string;
  caption: string;
};

export type Gallery = {
  slug: string;   // URL safe
  title: string;  // Display title
  subtitle: string;
  youtube: string;
  cover: string;
  folder: string; // Actual folder name
  photos: Photo[];
};

type GalleryDetails = {
  title?: unknown;
  subtitle?: unknown;
  youtube?: unknown;
  cover?: unknown;
  photos?: unknown;
  captions?: unknown;
};

type PhotoDetails = {
  file?: unknown;
  alt?: unknown;
  caption?: unknown;
};

const galleriesDir = path.join(process.cwd(), "public/galleries");

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function isImageFile(file: string): boolean {
  return IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase());
}

function naturalSort(a: string, b: string): number {
  const nameA = path.parse(a).name;
  const nameB = path.parse(b).name;

  const numA = parseInt(nameA, 10);
  const numB = parseInt(nameB, 10);

  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  }

  return nameA.localeCompare(nameB, undefined, { numeric: true });
}

function readDetails(folderPath: string, folder: string): GalleryDetails {
  const detailsPath = path.join(folderPath, "details.json");
  if (!fs.existsSync(detailsPath)) return {};

  try {
    const details = JSON.parse(fs.readFileSync(detailsPath, "utf-8"));
    if (!details || typeof details !== "object" || Array.isArray(details)) {
      console.warn(`details.json in ${folder} must be an object.`);
      return {};
    }
    return details;
  } catch (err) {
    console.warn(`Invalid details.json in ${folder}`, err);
    return {};
  }
}

function normalizePhotoDetails(details: GalleryDetails): Map<string, PhotoDetails> {
  const photos = new Map<string, PhotoDetails>();

  if (Array.isArray(details.photos)) {
    for (const photo of details.photos) {
      if (!photo || typeof photo !== "object" || Array.isArray(photo)) continue;
      const photoDetails = photo as PhotoDetails;
      if (typeof photoDetails.file === "string") {
        photos.set(photoDetails.file, photoDetails);
      }
    }
  }

  // Backwards compatibility with the previous details.json shape.
  if (details.captions && typeof details.captions === "object" && !Array.isArray(details.captions)) {
    for (const [file, caption] of Object.entries(details.captions)) {
      if (typeof caption === "string" && !photos.has(file)) {
        photos.set(file, { file, caption });
      }
    }
  }

  return photos;
}

export function getAllGalleries(): Gallery[] {
  if (!fs.existsSync(galleriesDir)) return [];

  const folders = fs.readdirSync(galleriesDir).filter((f) =>
    fs.statSync(path.join(galleriesDir, f)).isDirectory()
  );

  return folders.map((folder) => loadGallery(folder));
}

export function getGallery(slug: string): Gallery | null {
  const galleries = getAllGalleries();
  return galleries.find((g) => g.slug === slug) || null;
}

function loadGallery(folder: string): Gallery {
  const folderPath = path.join(galleriesDir, folder);
  const slug = slugify(folder);

  const details = readDetails(folderPath, folder);
  const photoDetails = normalizePhotoDetails(details);

  const files = fs
    .readdirSync(folderPath)
    .filter(isImageFile)
    .sort(naturalSort);

  const fileSet = new Set(files);
  const cover = typeof details.cover === "string" && fileSet.has(details.cover)
    ? details.cover
    : files[0] || "";

  const photos = files.map((file) => {
    const metadata = photoDetails.get(file);

    return {
      file,
      src: `/galleries/${folder}/${file}`,
      alt: typeof metadata?.alt === "string" && metadata.alt.trim()
        ? metadata.alt
        : `${typeof details.title === "string" && details.title.trim() ? details.title : folder} photo`,
      caption: typeof metadata?.caption === "string" ? metadata.caption : "",
    };
  });

  return {
    slug,
    title: typeof details.title === "string" && details.title.trim() ? details.title : folder,
    subtitle: typeof details.subtitle === "string" ? details.subtitle : "",
    youtube: typeof details.youtube === "string" ? details.youtube : "",
    cover,
    folder,
    photos,
  };
}
