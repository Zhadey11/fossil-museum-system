const revoked = new Set();

function revokeToken(token) {
  if (!token) return;
  revoked.add(token);
}

function isRevoked(token) {
  return revoked.has(token);
}

module.exports = { revokeToken, isRevoked };
