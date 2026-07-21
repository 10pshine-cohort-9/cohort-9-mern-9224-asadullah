const app = require('./src/app')
const connectToDb = require('./src/config/db')




require("dotenv").config();



async function startServer() {
  await connectToDb();

  app.listen(process.env.PORT, () => {
    console.log(`app is listening on ${process.env.PORT}`);
  });
}

startServer();

