require("dotenv").config();
const app = require("./gateway/server");
const port = Number(process.env.PORT || 5000);
app.listen(port, "0.0.0.0", () => console.log(`API Gateway listening on ${port}`));
