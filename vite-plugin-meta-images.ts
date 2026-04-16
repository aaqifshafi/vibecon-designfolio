import type { Plugin } from "vite";
import fs from "fs";
import path from "path";

const OG_EXTENSIONS = ["png", "jpg", "jpeg"] as const;

export function metaImagesPlugin(): Plugin {
  return {
    name: "vite-plugin-meta-images",
    transformIndexHtml(html) {
      const imagePath = resolveOpenGraphImagePath();
      if (!imagePath) return html;

      html = html.replace(
        /<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/g,
        `<meta property="og:image" content="${imagePath}" />`,
      );

      html = html.replace(
        /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/>/g,
        `<meta name="twitter:image" content="${imagePath}" />`,
      );

      return html;
    },
  };
}

function resolveOpenGraphImagePath(): string | null {
  const publicDirs = [
    path.resolve(process.cwd(), "client", "public"),
    path.resolve(process.cwd(), "public"),
  ];

  for (const dir of publicDirs) {
    for (const ext of OG_EXTENSIONS) {
      const filePath = path.join(dir, `opengraph.${ext}`);
      if (fs.existsSync(filePath)) {
        return `/opengraph.${ext}`;
      }
    }
  }

  return null;
}
