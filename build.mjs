import { build } from "esbuild";
import fs from "fs";

try {
    await build({
        entryPoints: ["./src/index.ts"],
        outfile: "./dist/index.js",
        bundle: true,
        minify: true,
        format: "iife",
        globalName: "plugin",
        external: ["@vendetta/*", "react", "react-native"],
        footer: { js: "module.exports = plugin.default || plugin;" }
    });

    if (!fs.existsSync("./dist")) fs.mkdirSync("./dist");
    
    const manifest = JSON.parse(fs.readFileSync("./manifest.json", "utf-8"));
    manifest.main = "index.js"; 
    fs.writeFileSync("./dist/manifest.json", JSON.stringify(manifest));
    
    console.log("GodMic Built!");
} catch (e) {
    console.error(e);
    process.exit(1);
}
