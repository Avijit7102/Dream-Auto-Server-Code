const express = require('express')
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const port = process.env.port || 6600;
const ObjectId = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wy6ti.mongodb.net/${process.env.DB_NAME}retryWrites=true&w=majority`;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Dream Auto!')
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db("dreamAuto").collection("services");
  const adminCollection = client.db("dreamAuto").collection("admin");
  const orderCollectionList = client.db("dreamAuto").collection("orderList");
  const reviewCollectionList = client.db("dreamAuto").collection("addReview");

  
  // perform actions on the collection object
  //client.close();
  console.log('database connected');


  //add service
  app.post('/addService', (req,res) => {
    const newService = req.body;
    console.log('adding new event: ', newService);
    serviceCollection.insertOne(newService)
    .then(result => {
      console.log('inserted count', result.insertedCount)
      res.send(result.insertedCount > 0)
    })
  })

  // get all service from database
  app.get('/service', (req, res) => {
    serviceCollection.find()
    .toArray((err, service) => {
      //console.log('from database', service);
      res.send(service)
    })
  })

  // delete a service for admin
  app.delete('/deleteService/:id', (req,res) => {
    const id = ObjectId(req.params.id);
    
    serviceCollection.findOneAndDelete({_id: id})
    
})

//add admin
app.post('/addAdmin', (req,res) => {
  const newAdmin = req.body;
  console.log('adding new admin: ', newAdmin);
  adminCollection.insertOne(newAdmin)
  .then(result => {
    console.log('inserted count', result.insertedCount)
    res.send(result.insertedCount > 0)
  })
})

//find admin
app.get('/admins', (req, res) => {
  adminCollection.find()
  .toArray((err, service) => {
    //console.log('from database', service);
    res.send(service)
  })
})

//checking admin

app.post('/isAdmin', (req, res) => {
  const email = req.body.email;
  adminCollection.find({ email: email })
      .toArray((err, admins) => {
          res.send(admins.length > 0);
      })
})

app.get('/checkout/:id', (req,res) => {
  const id = ObjectId(req.params.id)
  serviceCollection.find({"_id": ObjectId(id)})
  .toArray((err, items) => {
    //console.log(items);
      res.send(items)
  })
})


//adding order after payment successfully done
app.post('/addOrder', (req, res) => {
  const newOrder = req.body;
  console.log('new order',newOrder)
   orderCollectionList.insertOne(newOrder)
       .then(result => {
        console.log('inserted count for new order', result.insertedCount)
          res.send(result.insertedCount > 0);
     })
  
})

//get all orders for admin

app.get('/allOrders', (req, res) => {
  orderCollectionList.find()
  .toArray((err, order) => {
    //console.log('from database', service);
    res.send(order)
  })
})

// from admin after checking status
app.post('/updateOrder/:id', (req, res) => {
  const id = ObjectId(req.params.id)
  orderCollectionList.updateOne({"_id": ObjectId(id)},
  {$set: {"status": req.body.status}}
  )
  .then(result => {
    console.log('updated');
  })
  
})
// check your order by email id
app.get('/yourOrder', (req,res) => {
  orderCollectionList.find({userEmail: req.query.email})
  .toArray((err, items) => {
     res.send(items)
  })
})

// add review
app.post('/addReview', (req,res) => {
  const newReview = req.body;
  console.log('adding new review: ', newReview);
  reviewCollectionList.insertOne(newReview)
  .then(result => {
    console.log('inserted count', result.insertedCount)
    res.send(result.insertedCount > 0)
  })
})
// getting reviews for showing home page

app.get('/reviews', (req, res) => {
  reviewCollectionList.find()
  .toArray((err, order) => {
    //console.log('from database', service);
    res.send(order)
  })
})

});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})