// Muestra las URL para abrir el sitio desde el celular (misma red Wi-Fi) y lanza next.
import os from "node:os";
import { spawn } from "node:child_process";

const mode = process.argv[2] === "start" ? "start" : "dev";
const port = process.env.PORT || "3100";
const ips = Object.values(os.networkInterfaces()).flat().filter((i) => i && i.family === "IPv4" && !i.internal).map((i) => i.address);
console.log("\n  Abre en tu celular (misma red Wi-Fi):");
for (const ip of ips) console.log(`    http://${ip}:${port}`);
console.log(`  En esta PC: http://localhost:${port}\n`);
const child = spawn("npx", ["next", mode, "-H", "0.0.0.0", "-p", port], { stdio: "inherit", shell: true });
child.on("exit", (c) => process.exit(c ?? 0));
