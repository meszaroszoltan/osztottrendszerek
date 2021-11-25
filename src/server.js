const express = require('express');
const port = 3000;

express()
	.use(express.static('./src'))
	.listen(port, () => {
		console.log(`App running at http://localhost:${port}`)
	});
