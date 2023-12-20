const { Storage } = require("@google-cloud/storage");
const path = require("path");
const { Users } = require("../models/userModel");

const storage = new Storage({
  projectId: "yaafood",
  keyFilename: "yaafood-key.json",
});

const bucketName = "yaafood";
const bucket = storage.bucket(bucketName);



exports.uploadFotoProfile = async (req, res) => {
    try {
      const file = req.file;
      const refreshToken = req.cookies.refreshToken;
      
      // // if (!refreshToken) return res.sendStatus(204);
      // if (!refreshToken) {
      //   return res.status(401).json({
      //     success: false,
      //     msg: 'Login required. Please log in first.',
      //   });
      // }
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
  
      // // Menemukan user berdasarkan refresh token
      // const user = await Users.findOne({
      //   where: {
      //     refresh_token: refreshToken
      //   }
      // });
  
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
  
      stream.on("finish", async () => {
        const imageUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
  
        // Menyimpan imageUrl ke dalam kolom imageUrl pada tabel Users
        await user.update({ imageUrl });
  
        res.status(200).json({
          succes: true,
          msg: `Foto Berhasil Diupload.`,
          imageUrl: imageUrl,
        });
          
          
          
      });
  
      stream.on("error", (err) => {
        console.error(err);
        res.status(500).send("Error uploading file to GCS.");
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };
  




