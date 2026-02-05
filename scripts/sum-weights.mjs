import fs from "node:fs";

const questions = JSON.parse(
  fs.readFileSync("../src/data/questions.json", "utf8"),
);

const totals = { 121: 0, 122: 0, 123: 0, 124: 0, 125: 0, 126: 0 };

for (const q of questions) {
  for (const k of Object.keys(totals)) {
    totals[k] += Number(q.weights?.[k] ?? 0);
  }
}

console.log("Questions:", questions.length);
console.table(totals);
