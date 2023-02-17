const express = require('express')

const router = express.Router()
const controller = require('../controllers/cardsController')
const getErrorRes = require('../error_response')

// 取得
router
  .route('/card')
  .get( async (req, res) => {
    try {
      console.log('call')
      let result = await controller.getCardInfo(req, res)
      console.log(result)
      res.status(200).json({
        result: result
      })
    } catch (error) {
      res.json({
        status: "error",
        error: error.message
      })
    }
  })

router
  .route('/card')
  .post( async (req, res) => {
    try {
      console.log('call')
      let result = await controller.postCardInfo(req, res)
      console.log(result)
      res.status(200).json({
        result: result
      })
    } catch (error) {
      let result = getErrorRes(error)
      let status_code = result.status_code
      delete result.status_code
      res.status(status_code).json(result)
    }
  })


router
  .route('/card')
  .put( async (req, res) => {
    try {
      console.log('call')
      let result = await controller.putCardInfo(req, res)
      console.log(result)
      res.status(200).json({
        result: result
      })
    } catch (error) {
      let result = getErrorRes(error)
      let status_code = result.status_code
      delete result.status_code
      res.status(status_code).json(result)
    }
  })


router
  .route('/card')
  .delete( async (req, res) => {
    try {
      console.log('call')
      let result = await controller.deleteCardInfo(req, res)
      console.log(result)
      res.status(200).json({
        result: result
      })
    } catch (error) {
      let result = getErrorRes(error)
      let status_code = result.status_code
      delete result.status_code
      res.status(status_code).json(result)
    }
  })

module.exports = router