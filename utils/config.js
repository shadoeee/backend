require('dotenv').config();


const MONGODB_URI = process.env.MONGODB_URI;
  
const PORT = process.env.PORT;

module.exports = {
    MONGODB_URI,
    PORT
}
// config.js
// const config = {
//   MONGODB_URI: `mongodb+srv://bala:Balaganesh19@cluster0.pvchtl4.mongodb.net/Bala`,
//   PORT: 3000 // or your preferred port number
//   // Other configurations...
// };

// module.exports = config;
