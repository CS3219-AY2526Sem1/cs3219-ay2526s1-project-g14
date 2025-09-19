const router = require('express').Router();
const { postUsername, getUsernames } = require('./controller/user');

router.get("/user", getUsernames);
router.post("/user", postUsername);



module.exports = router;