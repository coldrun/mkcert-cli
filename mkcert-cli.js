#!/usr/bin/env node
//@ts-check
import { homedir } from "os";
import { join } from "path";
import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import minimist from "minimist";
import pc from "picocolors";
import mkcert from "vite-plugin-mkcert";

/**
 * Init, read variables and create folders
 */
const defaultOutDir = join(homedir(), ".mkcert-cli", "certs");
const argv = minimist(process.argv.slice(2));
const cwd = process.cwd();

const force = argv.f ?? false;
const verbose = argv.v ?? false;
const outDir = argv.outDir ? join(cwd, argv.outDir) : defaultOutDir;
const hosts = argv.host ? (Array.isArray(argv.host) ? argv.host : [argv.host]) : [];
const certFile = argv.cert ?? "dev.cert";
const keyFile = argv.key ?? "dev.key";
const certFilePath = join(outDir, certFile);
const keyFilePath = join(outDir, keyFile);

console.log(`
Running ${pc.green(`${pc.bold("mkcert-cli")}`)}...
`);

verbose &&
  console.log(`${pc.bold("With options:")}
  - ${pc.blue("cwd")}: ${pc.yellow(cwd)}
  - ${pc.blue("outDir")}: ${pc.yellow(outDir)}
  - ${pc.blue("host")}: ${JSON.stringify(hosts)}
  - ${pc.blue("force")}: ${force}
  - ${pc.blue("cert")}: ${certFile}
  - ${pc.blue("key")}: ${keyFile}
`);

if (!existsSync(outDir)) {
  await mkdir(outDir, { recursive: true });
}

/**
 * Create certificates
 */
const filesExist = existsSync(certFilePath) && existsSync(keyFilePath);
const writeFiles = force || !filesExist;
if (!writeFiles) {
  console.log(`🎉 Files "${pc.magenta(certFile)}" and "${pc.magenta(keyFile)}" already exist
    in ${pc.yellow(outDir)}`);
  process.exit(0);
}

try {
  /** @type { any } */
  const { config: installMkCert } = mkcert({
    force,
    hosts: hosts.length ? hosts : undefined,
    // autoUpgrade: boolean
    // source?: SourceType;
    // mkcertPath?: string;
  });
  const {
    server: { https: { key, cert } },
  } = await installMkCert({});
  await writeFile(keyFilePath, key, { encoding: "utf-8" });
  await writeFile(certFilePath, cert, { encoding: "utf-8" });
} catch (writeErr) {
  console.error(writeErr.toString());
  process.exit(1);
}

console.log(`🎉 Created "${pc.magenta(certFile)}" and "${pc.magenta(keyFile)}"
    in ${pc.yellow(outDir)}
`);
