import fs from "fs";
import path from "path";
import { Plugin } from "vite";

// custom vite plugin to dynamically create manifest.json
export function dynamicManifestPlugin(
  manifest: object,
  filename = "manifest.json"
) {
  const plugin: Plugin = {
    name: "dynamic-manifest-writer",

    configureServer() {
      const out = path.resolve(process.cwd(), "public", filename);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, JSON.stringify(manifest, null, 2));
    },

    closeBundle() {
      const out = path.resolve(process.cwd(), "dist", filename);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, JSON.stringify(manifest, null, 2));
    },
  };

  return plugin;
}
