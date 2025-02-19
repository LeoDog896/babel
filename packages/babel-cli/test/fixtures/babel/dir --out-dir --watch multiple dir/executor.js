const fs = require("fs");
const assert = require("assert");

// For Node.js <= 10
if (!assert.match) assert.match = (val, re) => assert(re.test(val));

const run = (async function* () {
  assert.match(yield, /Successfully compiled 4 files with Babel \(\d+ms\)\./);

  // wait 2s for watcher setup
  await new Promise(resolve => setTimeout(resolve, 2000));
  // update ./module1/src/index.js
  fs.writeFileSync(
    "./module1/src/index.js",
    `let str = REPLACE_ME + REPLACE_ME;`
  );

  assert.match(yield, /Successfully compiled 1 file with Babel \(\d+ms\)\./);
})();

run.next();

process.stdin.on("data", async function listener(chunk) {
  const str = String(chunk).trim();
  if (!str) return;

  console.log(str);

  if ((await run.next(str)).done) {
    process.exit(0);
  }
});

setTimeout(() => {
  console.error("EXECUTOR TIMEOUT");
  process.exit(1);
}, 5000);
