require('dotenv').config()
const express = require('express')
const compression = require('compression')
const morgan = require('morgan')
// const path = require('path')

const app = express()

app.use(compression())
app.use(morgan('combined'))

app.use('/static', express.static('./build/static'))
app.use('/', express.static('./build'))

app.get('*', (req, res) => {
  res.sendFile('index.html', { root: './build' })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, '0.0.0.0', err => {
  if (err) {
    console.info(err)
  }
  console.info(`==> 🌎 app listening on http://0.0.0.0:${PORT}.`)
})
