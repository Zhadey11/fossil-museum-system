const bcrypt = require("bcrypt");
const pwd = "Admin123!";
bcrypt.hash(pwd, 10).then((h) => {
  console.log("hash:", h);
  return bcrypt.compare(pwd, h);
}).then((ok) => console.log("verify:", ok));
