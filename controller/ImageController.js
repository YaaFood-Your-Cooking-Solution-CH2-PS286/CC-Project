const { Storage } = require("@google-cloud/storage");
const path = require("path");
const { articles, Users } = require("../models/userModel");

const storage = new Storage({
  projectId: "yaafood",
  keyFilename: "yaafood-key.json",
});

const bucketName = "yaafood";
const bucket = storage.bucket(bucketName);



exports.uploadImage = async (req, res) => {


  const { titleArtikel, description, ingredients, steps} = req.body;
  const requiredFields = [ 'titleArtikel', 'description', 'ingredients', 'steps', ];
  const missingFields = requiredFields.filter(field => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      msg: `Field berikut harus diisi: ${missingFields.join(', ')}`,
    });
  }
  
  try {
    const file = req.file;
    const body = req.body;
    // const refreshToken = req.cookies.refreshToken;
    // if (!refreshToken) return res.sendStatus(401);
    const refreshToken = req.cookies.refreshToken;
    // if (!refreshToken) {
    //   return res.status(401).json({
    //     success: false,
    //     msg: 'Login required. Please log in first.',
    //   });
    // }
    // const user = await Users.findAll({
    //     where:{
    //         refresh_token: refreshToken
    //     }
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

    if (!file) {
      return res.status(400).send("No file uploaded.");
    }

    const fileExtension = path.extname(file.originalname);
    const fileName = `image_${Date.now()}${fileExtension}`;

    const gcsFile = bucket.file(fileName);

    const stream = gcsFile.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    stream.end(file.buffer);

    stream.on("finish", () => {
      const imageUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;


      const Author = user[0].id;
    
    const createdAt = new Date();



      

      articles.create({
        imageUrl,
        titleArtikel,
        description,
        ingredients,
        createdAt,
        steps,
        userId: Author,
      });

      

      // res.status(200).send(`File uploaded. Access it at: ${imageUrl}`);

      res.status(200).json({
        succes: true,
        msg: `Artikel Berhasil diPost.`,
        imageUrl: imageUrl, 
        // data:Author,
        // data:post,
      });
    });
      

    stream.on("error", (err) => {
      console.error(err);
      // res.status(500).send("Error uploading file to GCS.");
      res.status(500).json({
        succes: false,
        msg: `Error uploading file to GCS`,
        // data:post,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }







  // try {
  //   const refreshToken = req.cookies.refreshToken;
  //   if(!refreshToken) return res.sendStatus(204);
  //   const user = await Users.findAll({
  //       where:{
  //           refresh_token: refreshToken
  //       }
  //   });

  //   const Author = user[0].id;
    
  //   const createdAt = new Date();
  //   // const Author = user [0].id;

  //   // Membuat artikel baru dan menyimpannya ke database
  //   const newArticle = await articles.create({
  //     imageUrl,
  //     titleArtikel,
  //     description,
  //     createdBy,
  //     createdAt,
  //     contentArtikel,
  //     userId:Author,
  //   });

  //   res.status(200).json({
  //     success: true,
  //     msg: 'Artikel berhasil disimpan',
  //     data: newArticle,
  //   });
  // } catch (error) {
  //   console.error('Error posting article:', error);
  //   res.status(500).json({
  //     success: false,
  //     msg: 'Terjadi kesalahan, tunggu beberapa saat',
  //   });
  // }












};




//     stream.end(file.buffer);

//     stream.on('finish', () => {
//       res.status(200).send(`File uploaded to: ${fileName}`);
//     });

//     stream.on('error', (err) => {
//       console.error(err);
//       res.status(500).send('Error uploading file to GCS.');
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   }
// };
