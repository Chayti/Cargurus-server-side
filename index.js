const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iea9q.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("carGurus");
        const productCollection = database.collection("products");
        const orderCollection = database.collection("orders");
        const usersCollection = database.collection("users");

        // GET API
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({})
            const products = await cursor.toArray()
            res.send(products)
        })

        // POST API
        app.post('/addProduct', async (req, res) => {
            const product = req.body
            const result = await productCollection.insertOne(product)
            res.json(result)
        })

        // GET Single product API
        app.get('/products/:productId', async (req, res) => {
            const id = req.params.productId
            const query = { _id: ObjectId(id) }
            const product = await productCollection.findOne(query)
            res.send(product)
        })

        // Delete single product
        app.delete('/products/:productId', async (req, res) => {
            const id = req.params.productId
            const query = { _id: ObjectId(id) }
            const result = await productCollection.deleteOne(query)
            res.send(result)
        })

        // Add Orders API
        app.post('/order', async (req, res) => {
            const order = req.body
            const result = await orderCollection.insertOne(order)
            res.json(result)
        })

        // GET all orders of an user API
        app.get('/myOrders/:email', async (req, res) => {
            const query = { email: req.params.email }
            const products = await orderCollection.find(query).toArray()
            res.send(products)
        })

        // Delete single order
        app.delete('/orders/:orderId', async (req, res) => {
            const id = req.params.orderId
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(query)
            res.send(result)
        })

        // GET all orders API
        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({})
            const products = await cursor.toArray()
            res.send(products)
        })

        //update status api
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: "shipped"
                }
            }
            const result = await orderCollection.updateOne(query, updateDoc, options);
            res.json(result)
        })

        // add user to DB
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // make admin api
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // find user role api
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Niche Website!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})