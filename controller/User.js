const {Users, articles, comment, resep, querybahan} = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const  where  = require("sequelize");
const { body, validationResult } = require('express-validator');
const moment = require('moment');
const { Sequelize } = require('sequelize');


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
        res.status(200).json({
          success: true,
          msg: 'User Ditemukan',
          data: users
        });
    }catch(error){
        console.log(error);
    }
};


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
      msg: 'Menampilkan Semua User By ID',
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

    // res.json(user);
    res.status(200).json({
      success: true,
      msg: 'Menampilkan Informasi User Berdasarkan Token',
      data: user,
    });
    
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

    res.status(200).json({ 
      Success: true,
      msg: 'Register Berhasil' 
    });
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
            success: true,
            msg: 'Berhasil Login',
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

const Logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
      return res.sendStatus(204);
  }

  const user = await Users.findAll({
      where: {
          refresh_token: refreshToken
      }
  });

  if (!user[0]) {
      return res.sendStatus(204);
  }

  const userId = user[0].id;

  await Users.update({ refresh_token: null }, {
      where: {
          id: userId
      }
  });

  res.clearCookie('refreshToken');

  // Send a JSON response with a success message
  return res.status(200).json({ 
    success: true,
    msg: 'Logout successful' });
}






const getAllArticles = async (req, res) => {
  try {
    // Mengambil semua artikel dari database
    // const allArticles = await articles.findAll(); // Gantilah ini dengan metode yang sesuai di dalam model atau service Anda
    // Mengambil semua resep dari database
    const allArtikel = await articles.findAll({
      where: {
        userId: {
          [Sequelize.Op.not]: null, // Menggunakan operator Sequelize.Op.not untuk mengecek bahwa userId tidak null
        }
      },
      include: [
        {
          model: Users,
          attributes: ['id','name', "imageUrl"], // Pilih atribut yang ingin Anda ambil dari tabel user
        },
      ]
    });

    // Randomize the order of articles
    const randomizedArtikel = allArtikel.sort(() => Math.random() - 0.5);

    const formattedResep = randomizedArtikel.map(article => ({
      id: article.id,
      imageUrl: article.imageUrl,
      titleArtikel: article.titleArtikel,
      description: article.description,
      ingredients: article.ingredients.split("--").filter(item => item.trim() !== ''),
      steps: article.steps.split("--").filter(item => item.trim() !== ''),
      createdAt: article.createdAt,
      userId: article.userId,
      updatedAt: article.updatedAt,
      user: {
        id:article.user.id,
        name: article.user.name,
        imageUrl: article.user.imageUrl,
      },
    }));

    res.status(200).json({
      success: true,
      msg: 'Berhasil mendapatkan semua artikel',
      data: formattedResep,
    });
  } catch (error) {
    console.error('Error getting all articles:', error);
    res.status(500).json({
      success: false,
      msg: 'Terjadi kesalahan, tunggu beberapa saat',
    });
  }
};




const getArticleById = async (req, res) => {
  const { id } = req.params;

  try {
    const article = await articles.findByPk(id, {
      include: [
        {
          model: Users,
          attributes: ['id','name', 'imageUrl'], // Choose the attributes you want to retrieve from the Users table
        },
      ],
    });

    const formattedResep = {
      id: article.id,
      imageUrl: article.imageUrl,
      titleArtikel: article.titleArtikel,
      description: article.description,
      ingredients: article.ingredients.split("--").filter(item => item.trim() !== ''),
      steps: article.steps.split("--").filter(item => item.trim() !== ''),
      createdAt: article.createdAt,
      userId: article.userId,
      updatedAt: article.updatedAt,
      user: {
        id:article.user.id,
        name: article.user.name,
        imageUrl: article.user.imageUrl,
      },
    };

    if (!article) {
      return res.status(404).json({
        success: false,
        msg: 'Artikel tidak ditemukan',
      });
    }

    res.status(200).json({
      success: true,
      msg: 'Berhasil Mendapatkan Artikel Berdasarkan ID Artikel',
      data: formattedResep,
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
      include: [
        {
          model: Users,
          attributes: ['id','name', 'imageUrl'],
        },
      ],
      order: [
        ['createdAt', 'DESC'], // Order by createdAt in descending order
      ],
    });

    const formattedResep = articlesByUser.map(article => ({
      id: article.id,
      imageUrl: article.imageUrl,
      titleArtikel: article.titleArtikel,
      description: article.description,
      ingredients: article.ingredients.split("--").filter(item => item.trim() !== ''),
      steps: article.steps.split("--").filter(item => item.trim() !== ''),
      createdAt: article.createdAt,
      userId: article.userId,
      updatedAt: article.updatedAt,
      user: {
        id:article.user.id,
        name: article.user.name,
        imageUrl: article.user.imageUrl,
      },
    }));

    res.status(200).json({
      success: true,
      msg: 'Berhasil mendapatkan Artikel Berdasarkan ID User',
      data: formattedResep,
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
    // const refreshToken = req.cookies.refreshToken;
    // if (!refreshToken) {
    //   return res.status(401).json({
    //     success: false,
    //     msg: 'Login required. Please log in first.',
    //   });
    // }

    // const user = await Users.findAll({
    //   where: {
    //     refresh_token: refreshToken,
    //   },
    // });
    if(!req.userId){
      return res.status(401).json({
        succes:false,
        msg:'Login required. Please Log In first' + req.userId,
      })
    }

    const user = await Users.findAll({
      where:{
        id:req.userId
      }
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
    const comments = await comment.findByPk(id, {
      include: [
        {
          model: Users,
          attributes: ['id','name', 'imageUrl'], // Choose the attributes you want to retrieve from the Users table
        },
      ],
    });

    if (!comments) {
      return res.status(404).json({
        success: false,
        msg: 'Comment tidak ditemukan',
      });
    }

    res.status(200).json({
      success: true,
      msg: 'Menampilkan Komentar Berdasarkan Artikel ID',
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
      include: [
        {
            model: Users,
            attributes: ['id','name', "imageUrl"], // Pilih atribut yang ingin Anda ambil dari tabel user
        },
    ]
    });

    res.status(200).json({
      success: true,
      msg:'Menampilkan Semua Komentar Berdasarkan ID User',
      data: {commentByUser},
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
    const comments = await comment.findAll({
      include: [
        {
            model: Users,
            attributes: ['id','name', "imageUrl"], // Pilih atribut yang ingin Anda ambil dari tabel user
        },
    ]
    }); // Gantilah ini dengan metode yang sesuai di dalam model atau service Anda
    
    res.status(200).json({
      success: true,
      msg: 'Berhasil mendapatkan semua komen artikel',
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


const getAllResep = async (req, res) => {
  try {
    // Mengambil semua artikel dari database
    const reseps = await resep.findAll(); // Gantilah ini dengan metode yang sesuai di dalam model atau service Anda

    if (!reseps || reseps.length === 0) {
      return res.status(404).json({
        success: false,
        msg: 'No recipes found',
      });
    }

    // Format each recipe in the array
    const formattedResep = reseps.map(resep => ({
      id: resep.id,
      title: resep.title,
      ingredients: resep.ingredients.split("--").filter(item => item.trim() !== ''),
      steps: resep.steps.split("--").filter(item => item.trim() !== ''),
      url: resep.url,
      createdAt: resep.createdAt,
      updatedAt: resep.updatedAt,
    }));

    res.status(200).json({
      success: true,
      msg: 'Berhasil mendapatkan semua artikel',
      data: formattedResep,
    });
  } catch (error) {
    console.error('Error getting all articles:', error);
    res.status(500).json({
      success: false,
      msg: 'Terjadi kesalahan, tunggu beberapa saat',
    });
  }
};






// const getRandomResep = async (req, res) => {
//   try {
//     // Mengambil semua resep dari database
//     const allReseps = await resep.findAll();

//     // Mengambil 5 resep secara acak
//     const randomReseps = getRandomReseps(allReseps, 2);

//     // Mengubah tanda -- menjadi array pada setiap resep
//     const formattedReseps = randomReseps.map(resep => {
//       const { id, title, ingredients, steps, url } = resep;
//       return {
//         Id: id,
//         Title: title,
//         Ingredients: ingredients.split("--").filter(item => item.trim() !== ''),
//         Steps: steps.split("--").filter(item => item.trim() !== ''),
//         URL: url,
//       };
//     });

//     res.status(200).json({
//       success: true,
//       msg: 'Berhasil mendapatkan 2 resep secara acak',
//       data: formattedReseps,
//     });
//   } catch (error) {
//     console.error('Error getting all recipes:', error);
//     res.status(500).json({
//       success: false,
//       msg: 'Terjadi kesalahan, tunggu beberapa saat',
//     });
//   }
// };


// Fungsi untuk mengambil n resep secara acak dari array resep
// function getRandomReseps(allReseps, n) {
//   const randomReseps = [];
//   let totalReseps = allReseps.length;

//   // Jika n lebih besar dari jumlah total resep, ambil semua resep
//   const count = Math.min(n, totalReseps);

//   for (let i = 0; i < count; i++) {
//     const randomIndex = Math.floor(Math.random() * totalReseps);
//     randomReseps.push(allReseps[randomIndex]);
//     // Hapus resep yang telah dipilih agar tidak dipilih lagi
//     allReseps.splice(randomIndex, 1);
//     totalReseps--;
//   }

//   return randomReseps;
// }




// const { Sequelize } = require('sequelize');
// const { query_bahan, resep } = require('../path-to-your-models'); // Adjust the path accordingly

// const getRandomResep = async (req, res) => {
//   try {
//     // Step 1: Fetch 2 random queries from the "query_bahan" table
//     const randomQueries = await querybahan.findAll({
//       order: Sequelize.literal('rand()'),
//       limit: 2,
//     });

//     if (randomQueries.length < 2) {
//       return res.status(404).json({
//         success: false,
//         msg: 'Not enough random queries found.',
//       });
//     }

//     // Step 2: Use each random query to find recipes in the "resep" table
//     const recipesWithRandomQueries = await Promise.all(
//       randomQueries.map(async (randomQuery) => {
//         // Split the random query into individual words
//         const queryWords = randomQuery.bahan.split(' ');

//         if (queryWords.length < 2) {
//           // Skip this query if it doesn't have at least 2 words
//           return {
//             query: {
//               QueryBahan: randomQuery.bahan,
//             },
//             recipes: [],
//           };
//         }

//         // Use the first 2 words from the query to search for recipes
//         const recipes = await resep.findAll({
//           where: {
//             ingredients: {
//               [Sequelize.Op.and]: queryWords.slice(0, 2).map(word => ({
//                 [Sequelize.Op.like]: `%${word}%`,
//               })),
//             },
//           },
//           // limit: 2, // Assuming you want 2 random recipes for each query
//         });

//         return {
//           query: {
//             QueryBahan: randomQuery.bahan,
//           },
//           recipes: recipes.map(recipe => ({
//             Id: recipe.id,
//             Title: recipe.title,
//             Ingredients: recipe.ingredients.split("--").filter(item => item.trim() !== ''),
//             Steps: recipe.steps.split("--").filter(item => item.trim() !== ''),
//             URL: recipe.url,
//           })),
//         };
//       })
//     );

//     res.status(200).json({
//       success: true,
//       msg: 'Berhasil mendapatkan resep secara acak berdasarkan 2 query.',
//       data: recipesWithRandomQueries,
//     });
//   } catch (error) {
//     console.error('Error getting random recipes:', error);
//     res.status(500).json({
//       success: false,
//       msg: 'Terjadi kesalahan, tunggu beberapa saat',
//     });
//   }
// };




const getRandomResep = async (req, res) => {
  try {
    // Step 1: Fetch a random query from the "query_bahan" table
    const randomQuery = await querybahan.findOne({
      attributes: ['bahan', 'imageUrl'],
      order: Sequelize.literal('rand()'),
    });

    if (!randomQuery) {
      return res.status(404).json({
        success: false,
        msg: 'No random query found.',
      });
    }

    // Step 2: Use the random query to find recipes in the "resep" table
    const queryWords = randomQuery.bahan.split(' ');

    // Use the first 2 words from the query to search for recipes
    const recipes = await resep.findAll({
      where: {
        ingredients: {
          [Sequelize.Op.and]: queryWords.map(word => ({
            [Sequelize.Op.like]: `%${word}%`,
          })),
        },
      },
      limit: 2, // Limiting to 2 recipes for each query
    });

    // Only include recipes that match the query
    const filteredRecipes = recipes.filter(recipe =>
      queryWords.every(word =>
        recipe.ingredients.toLowerCase().includes(word.toLowerCase())
      )
    );

    res.status(200).json({
      success: true,
      msg: 'Berhasil mendapatkan resep secara acak berdasarkan query.',
      data: {
        Bahan: randomQuery,
        Recipes: filteredRecipes.map(recipe => ({
          id: recipe.id,
          Title: recipe.title,
          Ingredients: recipe.ingredients.split("--").filter(item => item.trim() !== ''),
          Steps: recipe.steps.split("--").filter(item => item.trim() !== ''),
          URL: recipe.url,
        })),
      },
    });
  } catch (error) {
    console.error('Error getting random recipes:', error);
    res.status(500).json({
      success: false,
      msg: 'Terjadi kesalahan, tunggu beberapa saat',
    });
  }
};








const getResepById = async (req, res) => {
  const { id } = req.params;

  try {
    const reseps = await resep.findByPk(id);

    if (!reseps) {
      return res.status(404).json({
        success: false,
        msg: 'Resep tidak ditemukan',
      });
    }

    // Split pada properti ingredients dan steps
    const formattedResep = {
      id: reseps.id,
      Title: reseps.title,
      Ingredients: reseps.ingredients.split("--").filter(item => item.trim() !== ''),
      Steps: reseps.steps.split("--").filter(item => item.trim() !== ''),
      URL: reseps.url,
    };

    res.status(200).json({
      success: true,
      msg:'Menampilkan Resep Berdasarkan ID',
      data: formattedResep,
    });
  } catch (error) {
    console.error('Error fetching recipe by ID:', error);
    res.status(500).json({
      success: false,
      msg: 'Terjadi kesalahan, tunggu beberapa saat',
    });
  }
};



const getRandomArtikel = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 5
    // Mengambil semua resep dari database
    const allArtikel = await articles.findAll({
      where: {
        userId: {
          [Sequelize.Op.not]: null,
        },
      },
      order: Sequelize.literal('rand()'),
      limit,
      include: [
        {
          model: Users,
          attributes: ['name', 'imageUrl'],
        },
      ],
    });


    const formattedResep = allArtikel.map(article => ({
      id: article.id,
      imageUrl: article.imageUrl,
      titleArtikel: article.titleArtikel,
      description: article.description,
      ingredients: article.ingredients.split("--").filter(item => item.trim() !== ''),
      steps: article.steps.split("--").filter(item => item.trim() !== ''),
      createdAt: article.createdAt,
      userId: article.userId,
      updatedAt: article.updatedAt,
      user: {
        name: article.user.name,
        imageUrl: article.user.imageUrl,
      },
    }));

    res.status(200).json({
      success: true,
      msg: 'Berhasil mendapatkan 5 Artikel secara acak',
      data: formattedResep,
    });
  } catch (error) {
    console.error('Error getting Artikel:', error);
    res.status(500).json({
      success: false,
      msg: 'Terjadi kesalahan, tunggu beberapa saat',
    });
  }
};



// // mencari resep
// const { Op } = require('sequelize');

// const getAllResepByInput = async (req, res) => {
//   const { query } = req.body;
//   const requiredFields = ['query'];
//   const missingFields = requiredFields.filter(field => !req.body[field]);

//   if (missingFields.length > 0) {
//     return res.status(400).json({
//       success: false,
//       msg: `Field berikut harus diisi: ${missingFields.join(', ')}`,
//     });
//   }

//   try {
//     let reseps;
//     if (query) {
//       // Membagi query menjadi kata-kata terpisah
//       const keywords = query.split(/\s+/);

//       // Membuat kondisi pencarian menggunakan operator Op.and
//       const searchConditions = {
//         [Op.and]: keywords.map(keyword => ({
//           ingredients: {
//             [Op.like]: `%${keyword}%`,
//           },
//         })),
//       };

//       // Melakukan pencarian berdasarkan kondisi
//       reseps = await resep.findAll({
//         where: searchConditions,
//       });

//       // Format each recipe in the array
//       const formattedResep = reseps.map(resep => ({
//         id: resep.id,
//         title: resep.title,
//         ingredients_detected: query,
//         ingredients: resep.ingredients.split("--").filter(item => item.trim() !== ''),
//         steps: resep.steps.split("--").filter(item => item.trim() !== ''),
//         url: resep.url,
//         createdAt: resep.createdAt,
//         updatedAt: resep.updatedAt,
//       }));

//       res.status(200).json({
//         success: true,
//         msg: 'Berhasil mendapatkan resep',
//         data: formattedResep,
//       });
//     } else {
//       return res.status(400).json({
//         success: false,
//         msg: 'Masukkan kata kunci pencarian (query).',
//       });
//     }
//   } catch (error) {
//     console.error('Error getting recipes:', error);
//     res.status(500).json({
//       success: false,
//       msg: 'Terjadi kesalahan, tunggu beberapa saat',
//     });
//   }
// };






const getUserImageUrl = async (req, res) => {
  try {
    // Menggunakan req.userId yang telah diset oleh verifyToken
    const userId = req.userId;
    

    // Lakukan operasi atau kueri database berdasarkan informasi pengguna
    const user = await Users.findOne({
      where: { id: userId }, 
      attributes: ['imageUrl','name']// Sesuaikan dengan struktur database dan model Anda
    });

    res.status(200).json({
      success:true,
      msg: 'menampilkan Foto Profile User By Id',
      data: user,
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      msg: 'Internal Server Error',
    });
  }
};



const deleteArtikel = async (req, res) => {
  const { id } = req.params;

  try {
    // Cek apakah artikel dengan ID tersebut ada
    const artikel = await articles.findByPk(id);

    if (!artikel) {
      return res.status(404).json({
        success: false,
        msg: 'Artikel tidak ditemukan.',
      });
    }

    // Cek apakah user yang ingin menghapus adalah pemilik artikel
    // Anda dapat menyesuaikan ini dengan kebutuhan aplikasi Anda
    if (artikel.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        msg: 'Anda tidak memiliki izin untuk menghapus artikel ini. ',
        
      });
    }

    // Hapus artikel dari database
    await artikel.destroy();

    res.status(200).json({
      success: true,
      msg: 'Artikel berhasil dihapus.',
    });
  } catch (error) {
    console.error('Error deleting artikel:', error);
    res.status(500).json({
      success: false,
      msg: 'Terjadi kesalahan, tunggu beberapa saat.',
      
    });
  }
};



// const getArtikelComment = async (req, res) => {
// const getArtikelComment = async (req, res) => {

const getArtikelComment = async (req, res) => {
  const { id } = req.params;

  try {
    const comments = await comment.findAll({
      where: {
        artikelId: id,
      },
      include: [
        {
          model: Users,
          attributes: ['id','name', 'imageUrl'], // Choose the attributes you want to retrieve from the Users table
        },
      ],
    });

    if (!comments || comments.length === 0) {
      return res.status(404).json({
        success: false,
        msg: 'Tidak ada komentar untuk artikel ini',
      });
    }

    res.status(200).json({
      success: true,
      msg: 'Menampilkan semua komentar berdasarkan Artikel ID',
      data: comments,
    });
  } catch (error) {
    console.error('Error fetching comments by article ID:', error);
    res.status(500).json({
      success: false,
      msg: 'Terjadi kesalahan, tunggu beberapa saat',
    });
  }
};

const { Op } = require('sequelize');


const searchArticle = async (req, res) => {
  const { query } = req.body;

  const requiredFields = ['query'];
  const missingFields = requiredFields.filter((field) => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      msg: `Field berikut harus diisi: ${missingFields.join(", ")}`,
    });
  }

  try {
    let searchedArticles;

    // Split the query into separate keywords
    const keywords = query.split(/\s+/);

    // Create search conditions using the AND operator
    const andSearchConditions = {
      [Op.and]: keywords.map((keyword) => ({
        titleArtikel: {
          [Op.like]: `%${keyword}%`,
        },
      })),
    };

    // Perform the search based on the AND conditions
    searchedArticles = await articles.findAll({
      where: andSearchConditions,
      include: [
        {
          model: Users,
          attributes: ['id','name', 'imageUrl'],
        },
      ],
    });

    // Format each article in the array
    const formattedArticles = searchedArticles.map((article) => ({
      id: article.id,
      titleArtikel: article.titleArtikel,
      description: article.description,
      ingredients: article.ingredients.split("--").filter(item => item.trim() !== ''),
      steps: article.steps.split("--").filter(item => item.trim() !== ''),
      imageUrl: article.imageUrl,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      user: {
        id:article.user?.id || null,
        name: article.user?.name || null,
        imageUrl: article.user?.imageUrl || null,
      },
      // Add more fields as needed
    }));

    if (formattedArticles.length === 0) {
      // If no articles are found with all specified keywords, perform a search
      // for articles that have at least one of the specified keywords

      const orSearchConditions = {
        [Op.or]: keywords.map((keyword) => ({
          titleArtikel: {
            [Op.like]: `%${keyword}%`,
          },
        })),
      };

      searchedArticles = await articles.findAll({
        where: orSearchConditions,
        include: [
          {
            model: Users,
            attributes: ['id','name', 'imageUrl'],
          },
        ],
      });

      // Format each article in the array
      const orFormattedArticles = searchedArticles.map((article) => ({
        id: article.id,
        titleArtikel: article.titleArtikel,
        description: article.description,
        ingredients: article.ingredients.split("--").filter(item => item.trim() !== ''),
        steps: article.steps.split("--").filter(item => item.trim() !== ''),
        imageUrl: article.imageUrl,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        user: {
          id:article.user?.id || null,
          name: article.user?.name || null,
          imageUrl: article.user?.imageUrl || null,
        },
        // Add more fields as needed
      }));

      if (orFormattedArticles.length === 0) {
        // If no articles are found with alternative keywords, display a message
        res.status(200).json({
          success: true,
          msg: 'Maaf kata kunci tidak ditemukan dan tidak ada artikel yang serupa',
          data: []
          
        });
      } else {
        // Display alternative search results
        res.status(200).json({
          success: true,
          msg: 'Maaf kata kunci tidak ditemukan. Berikut artikel yang serupa',
          data:  orFormattedArticles,
          
        });
      }
    } else {
      // Display original search results
      res.status(200).json({
        success: true,
        msg: 'Berhasil mendapatkan artikel',
        data:  formattedArticles,
      });
    }
  } catch (error) {
    console.error('Error searching articles:', error);
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
    // postArticle,
    getUsersToken,
    getArticleById,
    getAllPostsByUserId,
    getUserById,
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
  };