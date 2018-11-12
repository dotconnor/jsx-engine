# jsx-engine
[![Maintainability](https://api.codeclimate.com/v1/badges/d2a6d8e502df1c974f03/maintainability)](https://codeclimate.com/github/dotconnor/jsx-engine/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/d2a6d8e502df1c974f03/test_coverage)](https://codeclimate.com/github/dotconnor/jsx-engine/test_coverage)

## Install
```
yarn add jsx-engine
```

## Usage
```javascript
// server.js
const express = require('express')
const app = express()
app.engine('jsx', require('jsx-engine'))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jsx')
app.get('/', (req, res) => {
  res.render('index')
});
```

```javascript
// views/index.js
module.exports = () => {
  return (
    <html lang='en'>
      <head>
        <title>jsx-engine</title>
      </head>
      <body>
        <div>Hey!</div>
      </body>
    </html>
  );
}
```
