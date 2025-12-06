import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import { join } from "path";

export async function GET() {
  try {
    const imagesDir = join(process.cwd(), "public", "images", "premade");
    const files = await readdir(imagesDir);

    // Filter only image files
    const imageFiles = files.filter((file) => {
      const ext = file.toLowerCase();
      return (
        ext.endsWith(".jpg") ||
        ext.endsWith(".jpeg") ||
        ext.endsWith(".png") ||
        ext.endsWith(".gif") ||
        ext.endsWith(".webp")
      );
    });

    const images = imageFiles.map((file, index) => ({
      id: `image-${index + 1}`,
      name: file.replace(/\.[^/.]+$/, ""), // Remove extension
      path: `/images/premade/${file}`,
    }));

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Error reading images directory:", error);
    return NextResponse.json({ images: [] }, { status: 200 });
  }
}
