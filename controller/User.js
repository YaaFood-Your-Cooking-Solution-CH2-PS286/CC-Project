const {Users, articles, comment} = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const  where  = require("sequelize");
const { body, validationResult } = require('express-validator');
const moment = require('moment');


const getUsers   = async(req, res) => {
    try{
        const users = await Users.findAll({
            // attributes:['id']
        });
        // const valueOfIdAtIndex0 = users[0].id;

    // const refreshToken = req.cookies.refreshToken;
    // if(!refreshToken) return res.sendStatus(204);
    // const user = await Users.findAll({
    //     where:{
    //         refresh_token: refreshToken
    //     }
    // });

    // const valueOfIdAtIndex0 = user[0].id;  
        res.json(users);

    }catch(error){
        console.log(error);
    }

}


const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await Users.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({
      success: false,
      msg: 'Terjadi kesalahan, tunggu beberapa saat',
    });
  }
};



const getUsersToken = async (req, res) => {
  try {
    // Menggunakan req.userId yang telah diset oleh verifyToken
    const userId = req.userId;

    // Lakukan operasi atau kueri database berdasarkan informasi pengguna
    const user = await Users.findOne({
      where: { id: userId }, // Sesuaikan dengan struktur database dan model Anda
    });

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      msg: 'Internal Server Error',
    });
  }
};

const isNameUnique = async (value) => {
  const existingUser = await Users.findOne({ where: { name: value } });
  if (existingUser) {
    return Promise.reject('Nama sudah digunakan, pilih nama lain');
  }
  return Promise.resolve();
};

const isEmailUnique = async (value) => {
  const existingUser = await Users.findOne({ where: { email: value } });
  if (existingUser) {
    return Promise.reject('Email sudah digunakan, pilih Email lain');
  }
  return Promise.resolve();
};

const registerValidationRules = [
  body('name').notEmpty().withMessage('Nama tidak boleh kosong').custom(isNameUnique),
  body('email').isEmail().withMessage('Format email tidak valid').custom(isEmailUnique),
  body('password').isLength({ min: 6 }).withMessage('Panjang password minimal 6 karakter'),
  body('confPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password dan Confirm Password tidak cocok');
    }
    return true;
  }),
];

const Register = async (req, res) => {
  // Jalankan validasi
  await Promise.all(registerValidationRules.map(validation => validation.run(req)));

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    await Users.create({
      name: name,
      email: email,
      password: hashPassword,
    });

    res.json({ msg: 'Register Berhasil' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Terjadi kesalahan saat melakukan registrasi' });
  }
};



const Login = async(req, res) =>{
    try {
        const user = await Users.findAll({
            where:{
                email: req.body.email
            }
        });
        const match = await bcrypt.compare(req.body.password, user[0].password);
        if(!match) return res.status(400).json({msg:"Wrong password"});
        const userId = user[0].id;
        const name = user[0].name;
        const email= user[0].email;
        const accessToken = jwt.sign({userId, name, email}, process.env.ACCESS_TOKEN_SECRET,{
          expiresIn:'1d',
      });

        const refreshToken = jwt.sign({userId, name, email}, process.env.REFRESH_TOKEN_SECRET,{
            expiresIn:'1d',
        });
        await Users.update({refresh_token: refreshToken}, {
            where:{
                id:userId
            }
        });
        res.cookie('refreshToken', refreshToken,{
            httpOnly: true,
            maxAge: 24*60*60*1000,
        })
         res.json({
            accessToken,
            user: {
                id: userId,
                name:name,
                email,
                 }
        });
    } catch (error) {
        res.status(404).json({msg:"Email Tidak Ditemukan"});
    }
}

const Logout = async(req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken) return res.sendStatus(204);
    const user = await Users.findAll({
        where:{
            refresh_token: refreshToken
        }
    });
    if(!user[0]) return res.sendStatus(204);
    const userId = user [0].id;
    await Users.update({refresh_token: null},{
        where:{
            id:userId
        }
    });
    res.clearCookie('refreshToken');
    return res.sendStatus(200);
}



const getAllArticles = async (req, res) => {
  try {
    // Mengambil semua artikel dari database
    const allArticles = await articles.findAll(); // Gantilah ini dengan metode yang sesuai di dalam model atau service Anda
    
    res.status(200).json({
      success: true,
      msg: 'Berhasil mendapatkan semua artikel',
      data: allArticles,
    });
  } catch (error) {
    console.error('Error getting all articles:', error);
    res.status(500).json({
      success: false,
      msg: 'Terjadi kesalahan, tunggu beberapa saat',
    });
  }
};



const postArticle = async (req, res) => {
  const { imageUrl, titleArtikel, description, createdBy, contentArtikel, userId} = req.body;
  const requiredFields = ['imageUrl', 'titleArtikel', 'description', 'createdBy', 'contentArtikel', ];
  const missingFields = requiredFields.filter(field => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      msg: `Field berikut harus diisi: ${missingFields.join(', ')}`,
    });
  }

  try {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken) return res.sendStatus(204);
    const user = await Users.findAll({
        where:{
            refresh_token: refreshToken
        }
    });

    const Author = user[0].id;
    
    const createdAt = new Date();
    // const Author = user [0].id;

    // Membuat artikel baru dan menyimpannya ke database
    const newArticle = await articles.create({
      imageUrl,
      titleArtikel,
      description,
      createdBy,
      createdAt,
      contentArtikel,
      userId:Author,
    });

    res.status(200).json({
      success: true,
      msg: 'Artikel berhasil disimpan',
      data: newArticle,
    });
  } catch (error) {
    console.error('Error posting article:', error);
    res.status(500).json({
      success: false,
      msg: 'Terjadi kesalahan, tunggu beberapa saat',
    });
  }
};




const getArticleById = async (req, res) => {
  const { id } = req.params;

  try {
    const article = await articles.findByPk(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        msg: 'Artikel tidak ditemukan',
      });
    }

    res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error('Error fetching article by ID:', error);
    res.status(500).json({
      success: false,
      msg: 'Terjadi kesalahan, tunggu beberapa saat',
    });
  }
};

const getAllPostsByUserId = async (req, res) => {
  const { id } = req.params; // Assuming userId is passed as a route parameter

  try {
    // Fetch all articles where userId matches the specified value
    const articlesByUser = await articles.findAll({
      where: {
        userId: id,
      },
    });

    res.status(200).json({
      success: true,
      data: articlesByUser,
    });
  } catch (error) {
    console.error('Error fetching articles by user ID:', error);
    res.status(500).json({
      success: false,
      msg: 'Terjadi kesalahan, tunggu beberapa saat',
    });
  }
};



const postComment = async (req, res) => {
  const { articleId, contentComment, } = req.body;

  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);

    const user = await Users.findAll({
      where: {
        refresh_token: refreshToken,
      },
    });

    const userId = user[0].id;

    const { id } = req.params;

    // Check if the article exists
    const artikel = await articles.findByPk(id);
    if (!artikel) {
      return res.status(404).json({
        success: false,
        msg: 'Article not found',
      });
    }

    const createdAt = new Date();
    const newComment = await comment.create({
      contentComment,
      artikelId: id,
      commentUserId: userId,
      createdAt
    });

    res.status(200).json({
      success: true,
      msg: 'Komentar berhasil disimpan',
      data: newComment,
    });
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({
      success: false,
      msg: 'Terjadi kesalahan, tunggu beberapa saat',
    });
  }
};







const getCommentsByArticleId = async (req, res) => {
  const { id } = req.params;

  try {
    const   comments = await comment.findByPk(id);

    if (!comments) {
      return res.status(404).json({
        success: false,
        msg: 'Comment tidak ditemukan',
      });
    }

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error('Error fetching comment by ID:', error);
    res.status(500).json({
      success: false,
      msg: 'Terjadi kesalahan, tunggu beberapa saat',
    });
  }
};


const getAllCommentByUserId = async (req, res) => {
  const { id } = req.params; // Assuming userId is passed as a route parameter

  try {
    // Fetch all articles where userId matches the specified value
    const commentByUser = await articles.findAll({
      where: {
        userId: id,
      },
    });

    res.status(200).json({
      success: true,
      data: commentByUser,
    });
  } catch (error) {
    console.error('Error fetching articles by user ID:', error);
    res.status(500).json({
      success: false,
      msg: 'Terjadi kesalahan, tunggu beberapa saat',
    });
  }
};


const getAllComments = async (req, res) => {
  try {
    // Mengambil semua artikel dari database
    const comments = await comment.findAll(); // Gantilah ini dengan metode yang sesuai di dalam model atau service Anda
    
    res.status(200).json({
      success: true,
      msg: 'Berhasil mendapatkan semua artikel',
      data: comments,
    });
  } catch (error) {
    console.error('Error getting all articles:', error);
    res.status(500).json({
      success: false,
      msg: 'Terjadi kesalahan, tunggu beberapa saat',
    });
  }
};




module.exports = {
    getUsers,
    Register,
    Login,
    Logout,
    getAllArticles,
    postArticle,
    getUsersToken,
    getArticleById,
    getAllPostsByUserId,
    getUserById,
    postComment,
    getCommentsByArticleId,
    getAllCommentByUserId,
    getAllComments
  };