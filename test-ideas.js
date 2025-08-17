const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'ideas.html'));
});

app.listen(PORT, () => {
    console.log(`创意中心测试服务器运行在 http://localhost:${PORT}`);
});
