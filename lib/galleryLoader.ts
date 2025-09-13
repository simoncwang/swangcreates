import fs from "fs";
import path from "path";

export type Photo = {
  src: string;
  description?: string;
};

export type Gallery = {
  slug: string;   // URL safe
  title: string;  // Display title
  subtitle: string; // Optional subtitle
  folder: string; // Actual folder name
  photos: Photo[];
};

const galleriesDir = path.join(process.cwd(), "public/galleries");

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
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

  // Default values
  let title = folder;
  let subtitle = "";
  let captions: Record<string, string> = {};

  // Look for details.json
  const detailsPath = path.join(folderPath, "details.json");
  if (fs.existsSync(detailsPath)) {
    try {
      const details = JSON.parse(fs.readFileSync(detailsPath, "utf-8"));
      if (details.title) title = details.title;
      if (details.subtitle) subtitle = details.subtitle;
      if (details.captions) captions = details.captions;
    } catch (err) {
      console.warn(`Invalid details.json in ${folder}`, err);
    }
  }

  const photos = fs
    .readdirSync(folderPath)
    .filter((file) =>
      [".jpg", ".jpeg", ".png", ".webp"].includes(path.extname(file).toLowerCase())
    )
    // ✅ natural sort by number if filename starts with digits
    .sort((a, b) => {
      const nameA = path.parse(a).name;
      const nameB = path.parse(b).name;

      const numA = parseInt(nameA, 10);
      const numB = parseInt(nameB, 10);

      // If both are numbers, compare numerically
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      // Otherwise, fallback to normal string sort
      return nameA.localeCompare(nameB, undefined, { numeric: true });
    })
    .map((file) => ({
      src: `/galleries/${folder}/${file}`,
      description: captions[file] || "",
    }));

  return {
    slug,
    title,
    subtitle,
    folder,
    photos,
  };
}
