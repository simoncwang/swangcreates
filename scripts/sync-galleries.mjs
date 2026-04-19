import fs from "fs";
import path from "path";
import process from "process";

const galleriesDir = path.join(process.cwd(), "public/galleries");
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const mode = process.argv.includes("--check") ? "check" : "sync";

function isImageFile(file) {
  return imageExtensions.has(path.extname(file).toLowerCase());
}

function naturalSort(a, b) {
  const nameA = path.parse(a).name;
  const nameB = path.parse(b).name;
  const numA = parseInt(nameA, 10);
  const numB = parseInt(nameB, 10);

  if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
    return numA - numB;
  }

  return nameA.localeCompare(nameB, undefined, { numeric: true });
}

function titleFromFolder(folder) {
  return folder
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function photoNumber(file) {
  const number = parseInt(path.parse(file).name, 10);
  return Number.isNaN(number) ? null : number;
}

function captionFromLegacyCaptions(file, captions) {
  if (!captions || typeof captions !== "object" || Array.isArray(captions)) return "";
  if (typeof captions[file] === "string") return captions[file];

  const lowerFile = file.toLowerCase();
  const numericFile = photoNumber(file);

  for (const [captionFile, caption] of Object.entries(captions)) {
    if (typeof caption !== "string") continue;
    if (captionFile.toLowerCase() === lowerFile) return caption;
    if (numericFile !== null && photoNumber(captionFile) === numericFile) return caption;
  }

  return "";
}

function existingPhotosByFile(details) {
  const photos = new Map();
  if (!Array.isArray(details?.photos)) return photos;

  for (const photo of details.photos) {
    if (!photo || typeof photo !== "object" || typeof photo.file !== "string") continue;
    photos.set(photo.file, photo);
  }

  return photos;
}

function detailsForGallery(folder, files, existingDetails) {
  const details = existingDetails && typeof existingDetails === "object" && !Array.isArray(existingDetails)
    ? existingDetails
    : {};
  const existingPhotos = existingPhotosByFile(details);
  const fileSet = new Set(files);
  const cover = typeof details.cover === "string" && fileSet.has(details.cover)
    ? details.cover
    : files[0] || "";

  return {
    title: typeof details.title === "string" && details.title.trim() ? details.title : titleFromFolder(folder),
    subtitle: typeof details.subtitle === "string" ? details.subtitle : "",
    youtube: typeof details.youtube === "string" ? details.youtube : "",
    cover,
    photos: files.map((file) => {
      const existingPhoto = existingPhotos.get(file);

      return {
        file,
        alt: typeof existingPhoto?.alt === "string" ? existingPhoto.alt : "",
        caption: typeof existingPhoto?.caption === "string"
          ? existingPhoto.caption
          : captionFromLegacyCaptions(file, details.captions),
      };
    }),
  };
}

function validateGallery(folder, files, details) {
  const issues = [];
  const fileSet = new Set(files);

  if (files.length === 0) {
    issues.push("has no supported image files");
  }

  if (!details || typeof details !== "object" || Array.isArray(details)) {
    issues.push("is missing a valid details.json object");
    return issues;
  }

  if (typeof details.title !== "string" || !details.title.trim()) {
    issues.push("is missing a title");
  }

  if (typeof details.cover !== "string" || !fileSet.has(details.cover)) {
    issues.push(`has an invalid cover: ${String(details.cover || "")}`);
  }

  if (!Array.isArray(details.photos)) {
    issues.push("is missing a photos array");
    return issues;
  }

  const metadataFiles = new Set();
  for (const photo of details.photos) {
    if (!photo || typeof photo !== "object" || typeof photo.file !== "string") {
      issues.push("has a photo entry without a file");
      continue;
    }

    metadataFiles.add(photo.file);
    if (!fileSet.has(photo.file)) {
      issues.push(`references missing image: ${photo.file}`);
    }
  }

  for (const file of files) {
    if (!metadataFiles.has(file)) {
      issues.push(`is missing metadata for image: ${file}`);
    }
  }

  return issues;
}

function jsonString(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function main() {
  if (!fs.existsSync(galleriesDir)) {
    console.log("No public/galleries directory found.");
    return;
  }

  const folders = fs
    .readdirSync(galleriesDir)
    .filter((folder) => fs.statSync(path.join(galleriesDir, folder)).isDirectory())
    .sort();

  let hadIssues = false;

  for (const folder of folders) {
    const folderPath = path.join(galleriesDir, folder);
    const detailsPath = path.join(folderPath, "details.json");
    const files = fs.readdirSync(folderPath).filter(isImageFile).sort(naturalSort);

    let existingDetails = null;
    try {
      existingDetails = readJson(detailsPath);
    } catch (error) {
      hadIssues = true;
      console.error(`${folder}: invalid details.json (${error.message})`);
      continue;
    }

    const nextDetails = detailsForGallery(folder, files, existingDetails);
    const issues = validateGallery(folder, files, nextDetails);
    if (issues.length > 0) {
      hadIssues = true;
      for (const issue of issues) {
        console.error(`${folder}: ${issue}`);
      }
    }

    const nextJson = jsonString(nextDetails);
    const currentJson = fs.existsSync(detailsPath) ? fs.readFileSync(detailsPath, "utf-8") : "";

    if (mode === "check") {
      if (nextJson !== currentJson) {
        hadIssues = true;
        console.error(`${folder}: details.json is out of sync; run npm run galleries:sync`);
      }
      continue;
    }

    if (nextJson !== currentJson) {
      fs.writeFileSync(detailsPath, nextJson);
      console.log(`${folder}: wrote details.json`);
    } else {
      console.log(`${folder}: details.json already up to date`);
    }
  }

  if (hadIssues) {
    process.exitCode = 1;
  }
}

main();
