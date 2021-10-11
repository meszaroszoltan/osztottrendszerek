const express = require('express');
const port = 3000;

express()
.use(express.static('.'))
.listen(port, () => {
  console.log(`App runing at http://localhost:${port}`)
});
