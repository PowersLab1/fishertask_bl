const express = require('express');
const app = express();
const port = 3000;

// Serve static files (like HTML, CSS, and JavaScript)
app.use(express.static('public'));

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
