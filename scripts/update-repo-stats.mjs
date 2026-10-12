import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
const stars = Number(
  execFileSync(
    "gh",
    ["api", "repos/draexon/pros", "--jq", ".stargazers_count"],
    { encoding: "utf8" },
  ).trim(),
);
if (!Number.isSafeInteger(stars) || stars < 0)
  throw new Error("Invalid GitHub star count");
writeFileSync(
  new URL("../src/repo-stats.json", import.meta.url),
  JSON.stringify({ stars, verifiedAt: new Date().toISOString() }, null, 2) +
    "\n",
);
console.log("Verified repository stars:", stars);
