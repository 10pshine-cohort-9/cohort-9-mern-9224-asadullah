   require("dotenv").config();

  const app = require('./src/app')
  const connectToDb = require('./src/config/db')


  async function startServer() {
    try {
      await connectToDb();

     const server = app.listen(process.env.PORT, () => {
        console.log(`app is listening on ${process.env.PORT}`);
      })


       server.on('error', (error) => {
            console.error('Failed to start server:', error.message);
            process.exit(1);
        });

    } catch (error) {
      console.error('Failed to start server:', error.message);
      process.exit(1);
    }
  }

  startServer();
