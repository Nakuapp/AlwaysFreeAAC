import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const stagedOnly = process.argv.includes("--staged");
const paths = gitPaths(
  stagedOnly
    ? ["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"]
    : ["ls-files", "-co", "--exclude-standard", "-z"],
);
const readablePaths = stagedOnly ? paths : paths.filter(existsSync);
const invalidPaths = [];

for (const path of readablePaths) {
  const content = stagedOnly ? readIndexBlob(path) : readFileSync(path);
  if (!isText(path, content)) continue;
  if (content.includes(13)) invalidPaths.push(path);
}

if (invalidPaths.length > 0) {
  console.error("LF line endings are required. CR characters found in:");
  for (const path of invalidPaths) console.error(`  ${path}`);
  console.error("Run `npm run format` and stage the files again.");
  process.exit(1);
}

console.log(
  `LF check passed (${readablePaths.length} file${readablePaths.length === 1 ? "" : "s"} checked).`,
);

function gitPaths(args) {
  const output = execFileSync("git", args, { encoding: "buffer" });
  return output.toString("utf8").split("\0").filter(Boolean);
}

function readIndexBlob(path) {
  return execFileSync("git", ["show", `:${path}`], {
    encoding: "buffer",
    maxBuffer: 100 * 1024 * 1024,
  });
}

function isText(path, content) {
  const output = execFileSync("git", ["check-attr", "--cached", "-z", "text", "--", path], {
    encoding: "buffer",
  });
  const [, , value = "unspecified"] = output.toString("utf8").split("\0");
  if (value === "unset") return false;
  if (value === "set") return true;
  return !content.subarray(0, 8192).includes(0);
}
