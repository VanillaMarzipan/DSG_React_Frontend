const data = require('./db.json')
const express = require('express')
var cors = require('cors')
const server = express()

server.use(cors())

server
  .route('/api/v1/Associate/AuthenticateAssociate')
  .all((req, res, next) => res.json(data.associate))

server
  .route('/api/v1/Configuration')
  .all((req, res, next) => res.json(data.configuration))

server
  .route('/api/v1/Register/RegisterNumber/*')
  .all((req, res, next) => res.json(data.registerData))
server
  .route('/api/v1/Register/GetRegister/*')
  .all((req, res, next) => res.json(data.registerData))

server
  .route('/api/v1/Register/RegisterValidation/*')
  .all((req, res, next) => res.json(data.registerValid))

server
  .route('/api/v1/Register/OpenRegister/*')
  .all((req, res, next) => res.json(data.registerOpenResponse))
server
  .route('/api/v1/Register/CloseRegister/*')
  .all((req, res, next) => res.json(data.registerCloseResponse))

server
  .route('/api/v1/Transaction/ActiveTransaction/*')
  .all((req, res, next) => res.json(data.transactionData))
server
  .route('/api/v1/Transaction/*')
  .all((req, res, next) => res.json(data.transactionData))
server
  .route('/api/v1/Product/*')
  .all((req, res, next) => res.json(data.transactionData))

server
  .route('/api/v1/Tender/*')
  .all((req, res, next) => res.json(data.tenderResponse))

server
  .route(['/api/v1/Loyalty/zip/*'])
  .all((req, res, next) => res.json(data.zip))

server
  .route(['/api/v1/Loyalty/*'])
  .get((req, res, next) => res.json(data.loyaltyCustomers))
  .post((req, res, next) => res.json(data.newLoyaltyAccount))
  .put((req, res, next) => res.json(data.newLoyaltyAccount))

server
  .route(['/api/v1/Features/*'])
  .get((req, res, next) => res.json(data.features))

server
  .route(['/api/v1/Feedback/*'])
  .all((req, res, next) => res.json({ status: 'ok' }))

server.route('/').all((req, res, next) => res.json(data))

server.listen(3001, () => {
  console.info('JSON Server is running on port 3001')
})
