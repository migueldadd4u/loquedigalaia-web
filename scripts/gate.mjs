import { spawnSync } from "node:child_process";

const checks = [
  ["npm", ["run", "lint"]],
  ["npm", ["test"]],
];

for (const [command, args] of checks) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("gate · lint, build estático y tests deterministas: OK");
