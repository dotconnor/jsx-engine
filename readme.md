# jsx-engine

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
