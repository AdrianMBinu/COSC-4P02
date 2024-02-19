const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Listen on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
