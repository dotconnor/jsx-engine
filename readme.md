# jsx-engine

## Install
```
yarn add jsx-engine
```

## Usage

```javascript
const express = require('express')
const app = express()
app.engine('jsx', require('jsx-engine'))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jsx')
app.get('/', (req, res) => {
  res.render('index')
});
```