const express = require('express')

const router = express.Router()
const controller = require('../controllers/usersController')
const getErrorRes = require('../error_response')

// ユーザープロフィール取得
router
  .route('/user')
  .get( async (req, res) => {
    try {
      console.log('call')
      let result = await controller.getUserProfile(req, res)
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

// ユーザープロフィール登録
router
  .route('/user')
  .post(async (req, res) => {
    try {
      console.log('call')
      let result = await controller.postUserProfile(req, res)
      console.log(result)
      res.status(200).json({
        status: "created",
      })
    } catch (error) {
      let result = getErrorRes(error)
      let status_code = result.status_code
      delete result.status_code
      res.status(status_code).json(result)
    }
  })

// ユーザープロフィール更新
router
  .route('/user')
  .put( async (req, res) => {
    try {
      console.log('call')
      let result = await controller.putUserProfile(req, res)
      console.log(result)
      res.status(200).json({
        status: "updated",
      })
    } catch (error) {
      let result = getErrorRes(error)
      let status_code = result.status_code
      delete result.status_code
      res.status(status_code).json(result)
    }
  })

// ユーザー削除
router
  .route('/user')
  .delete( async (req, res) => {
    try {
      console.log('call')
      let result = await controller.deleteUserProfile(req, res)
      console.log(result)
      res.status(200).json({
        status: "deleted",
      })
    } catch (error) {
      let result = getErrorRes(error)
      let status_code = result.status_code
      delete result.status_code
      res.status(status_code).json(result)
    }
  })


module.exports = router