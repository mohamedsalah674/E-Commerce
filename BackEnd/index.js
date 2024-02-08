const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
const dns = require('dns');


// Set the DNS server for this application
dns.setServers(['8.8.8.8', '8.8.4.4']);



mongoose.set('strictQuery', false);
dotenv.config();




const start = async () => {



  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  if (!process.env.MONGO_URL) {
    throw new Error('MONGO_URI must be defined');
  }

  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'eshop-database'
})
.then(()=>{
    console.log('Database Connection is ready...')
})
.catch((err)=> {
    console.log(err);
})

  app.listen(4001, () => {
    console.log('Listening on port 4001!!!!!!!!');
  });
};

start();
