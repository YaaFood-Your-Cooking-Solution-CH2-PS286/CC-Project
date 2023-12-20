const express = require("express");
const {getUsers, 
    Register, 
    Login, 
    Logout, 
    // postArticle, 
    getAllArticles,
    getUsersToken,
    getUserById,
    getArticleById,
    getAllPostsByUserId,
    postComment,
    getCommentsByArticleId,
    getAllCommentByUserId,
    getAllComments,
    getAllResep,
    getRandomResep,
    getResepById,
    getRandomArtikel,
    // getAllResepByInput,
    getUserImageUrl,
    deleteArtikel,
    getArtikelComment,
    searchArticle
    

} = require("../controller/User");
const verifyToken = require("../middleware/VerifyToken")
const refreshToken = require("../controller/RefreshToken");
const multer = require("multer");



const multerStorage = multer.memoryStorage();
// const upload = multer({ storage: multerStorage });
const router = express.Router();


// Routes for user information
router.get("/user", verifyToken, getUsers);
router.get('/user/:id', getUserById);
router.get("/userByAccessToken",verifyToken, getUsersToken);
router.get("/refreshToken", refreshToken);


// Routes for login
router.post("/register", Register);
router.post("/login", Login);
router.delete("/logout", Logout);


// Routes for articles
// router.post('/artikel', verifyToken, postArticle)
router.get('/allArtikel', getAllArticles)
router.get('/artikel/byUserId/:id',  getAllPostsByUserId)
router.get('/artikel/:id', getArticleById)


// Routes for comments
router.post('/artikel/comment/:id',verifyToken, postComment);
router.get('/comment/:id', getCommentsByArticleId);
router.get('/comment/byUser/:id',getAllCommentByUserId);
router.get('/comment', getAllComments);
// coment by userId

// Define route for fetching comments by article ID
router.get('/articles/:id/comments', getArtikelComment);

//Routes for Upload Image
const ImageController = require('../controller/ImageController');
const multerMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});


// Upload Artikel
router.post('/uploadArtikel',verifyToken, multerMiddleware.single('file'), ImageController.uploadImage);

// Show all resep
router.get('/resep', getAllResep);

// Get resep by ID
router.get('/Resep/:id', getResepById)

//Get All Random Resep(5)
router.get('/randomResep', getRandomResep);

// Get All Random Artikel (5)
router.get('/randomArtikel',getRandomArtikel);


const searchResep = require('../controller/getResep');

// Get Resep By Input User
router.post('/searchResep', searchResep);


// upload foto profile user
const profile = require('../controller/profile');




router.post('/uploadFotoProfile',verifyToken, multerMiddleware.single('file'), profile.uploadFotoProfile);


// const getUserImageUrl = require('../controller/profile');

router.get('/getUserImageUrl/:id',verifyToken, getUserImageUrl);

// hapus artikel
router.delete('/deleteArticles/:id',verifyToken, deleteArtikel);

// // edit potoprofile
// const editFotoProfile = require('../controller/ImageController');
// router.put('/uploadFotoProfile',verifyToken, multerMiddleware.single('file'), editFotoProfile.changeFotoProfile);




router.post('/searchArticle', searchArticle);

module.exports = router;