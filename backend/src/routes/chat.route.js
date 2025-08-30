const express = require("express")
const middleware = require("../middlewares/auth.middleware")
const chatRoutes = require("../controllers/chat.controller")
const router = express.Router()

router.post("/", middleware.authUser ,chatRoutes.createChat)
router.get('/', middleware.authUser, chatRoutes.getChats)

router.get('/messages/:id', middleware.authUser, chatRoutes.getMessages)

module.exports = router