const fs = require("fs");
const path = require("path");

const storeDir = path.join(process.cwd(), ".runtime");
const storeFile = path.join(storeDir, "revoked_tokens.json");
const revoked = new Set();

function loadPersisted() {
  try {
    if (!fs.existsSync(storeFile)) return;
    const raw = fs.readFileSync(storeFile, "utf8");
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return;
    for (const t of arr) {
      if (typeof t === "string" && t.length > 0) revoked.add(t);
    }
  } catch {
    /* ignore */
  }
}

function persist() {
  try {
    fs.mkdirSync(storeDir, { recursive: true });
    fs.writeFileSync(storeFile, JSON.stringify([...revoked], null, 2), "utf8");
  } catch {
    /* ignore */
  }
}

loadPersisted();

function revokeToken(token) {
  if (!token) return;
  revoked.add(token);
  persist();
}

function isRevoked(token) {
  return revoked.has(token);
}

module.exports = { revokeToken, isRevoked };
