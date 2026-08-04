const test = require("node:test");
const assert = require("node:assert/strict");
const app = require("../src/app");
const { connectDB, mongoose } = require("../src/config/database");

test("GET /api/v1/content/campaigns/ returns a list payload", async () => {
  await connectDB();
  const server = app.listen(0);

  const { port } = await new Promise((resolve) => server.once("listening", () => resolve({ port: server.address().port })));

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/v1/content/campaigns/`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.success, true);
    assert.ok(Array.isArray(payload.data));
  } finally {
    server.close();
    await mongoose.disconnect();
  }
});
