const express = require("express");
const dotenv = require("dotenv");
const db = require("./config/database");
const router = require("./routes");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");

dotenv.config();
const app = express();

async function connectToDatabase() {
  try {
    await db.authenticate();
    console.log("Database connected....");
  } catch (error) {
    console.error(error);
  }
}

app.use(bodyParser.urlencoded({ extended: true }));


// app.use(cors({Credential:true, origin:"http://localhost:3000"}));
app.use(cookieParser());
app.use(express.json());
app.use(router);

app.get('/', (req, res) => {
  res.send('Yafood Service Active')
});

app.listen(5000, ()=> console.log('Server running at port 5000'));



// Call the async function
connectToDatabase();
