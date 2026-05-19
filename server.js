/**
 * Local development server
 * For Vercel deployment, the app is exported from api/index.js
 */
const app = require("./app");

const PORT = process.env.PORT || 2022;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));