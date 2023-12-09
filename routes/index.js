const express = require("express");
const {getUsers, 
    Register, 
    Login, 
    Logout, 
    postArticle, 
    getAllArticles,
    getUsersToken,
    getUserById,
    getArticleById,
    getAllPostsByUserId,
    postComment,
    getCommentsByArticleId,
    getAllCommentByUserId,
    getAllComments

} = require("../controller/User");
const verifyToken = require("../middleware/VerifyToken")
const refreshToken = require("../controller/RefreshToken");
const multer = require("multer");



const multerStorage = multer.memoryStorage();
// const upload = multer({ storage: multerStorage });
const router = express.Router();


// Routes for user information
router.get("/user", verifyToken, getUsers);
router.get('/user/:id',verifyToken, getUserById);
router.get("/userByAccessToken",verifyToken, getUsersToken);
router.get("/refreshToken", refreshToken);


// Routes for login
router.post("/register", Register);
router.post("/login", Login);
router.delete("/logout", Logout);


// Routes for articles
router.post('/artikel', verifyToken, postArticle)
router.get('/allArtikel',verifyToken, getAllArticles)
router.get('/artikel/byUserId/:id', verifyToken, getAllPostsByUserId)
router.get('/artikel/:id',verifyToken, getArticleById)


// Routes for comments
router.post('/artikel/:id/comment/',verifyToken, postComment);
router.get('/comment/:id',verifyToken, getCommentsByArticleId);
router.get('/comment/byUser/:id',verifyToken, getAllCommentByUserId);
router.get('/comment',verifyToken, getAllComments);
// coment by userId



module.exports = router;