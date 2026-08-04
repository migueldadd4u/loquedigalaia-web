import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";

const workflow = await readFile(new URL("../.github/workflows/deploy.yml", import.meta.url), "utf8");
const legacyCron = await readFile(new URL("../agent/snapshot-cron.sh", import.meta.url), "utf8");

function executableLines(source) {
  return source
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("#"))
    .join("\n");
}

test("el workflow cubre push, horario y ejecución manual con concurrencia única", () => {
  assert.match(workflow, /^\s*push:/m);
  assert.match(workflow, /^\s*schedule:/m);
  assert.match(workflow, /^\s*workflow_dispatch:/m);
  assert.match(workflow, /cron:\s*'15 4 \* \* \*'/);
  assert.match(workflow, /group:\s*deploy-produccion/);
  assert.match(workflow, /cancel-in-progress:\s*false/);
});

test("restaura, ingiere, pasa el gate y solo entonces despliega", () => {
  const commands = [
    "npm run pulso:restore",
    "npm run snapshot:daily",
    "npm run gate",
    "npm run deploy:out",
  ];
  const positions = commands.map((command) => workflow.indexOf(command));
  positions.forEach((position, index) => assert.ok(position >= 0, `falta ${commands[index]}`));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
  assert.match(workflow, /PULSO_STATE_URL:\s*https:\/\/loquedigalaia\.com\/pulso-state\.json/);
});

test("el workflow tiene Git de solo lectura y nunca commitea el estado", () => {
  assert.match(workflow, /permissions:\s*\n\s+contents:\s*read/);
  assert.doesNotMatch(executableLines(workflow), /\bgit\s+(?:add|commit|push)\b/);
  assert.match(workflow, /data\/pulso\.json/);
  assert.match(workflow, /data\/history\.json/);
  assert.match(workflow, /data\/source-status\.json/);
  assert.match(workflow, /data\/pending\.json/);
});

test("el cron local legado es un stub no mutante", () => {
  const executable = executableLines(legacyCron);
  assert.match(legacyCron, /DEPRECADO/);
  assert.match(executable, /exit 0/);
  assert.doesNotMatch(executable, /\bgit\s+(?:add|commit|push|pull|checkout)\b/);
  assert.doesNotMatch(executable, /\b(?:npm|node|wrangler)\b/);
});
