//const MongoClient = require('mongodb');
const fetch = require('node-fetch');
const express = require('express');
const http = require('http');
const { PubSub } = require('apollo-server');
const { ApolloServer, gql } = require('apollo-server-express');
var mongoose = require('mongoose')
const MongoClient = require('mongodb').MongoClient

mongoose.connect('mongodb://localhost:27017/test', (err, res) => {
  if (err) {
    throw err
  } else {
    console.log('La base de datos esta corriendo correctamente')
  }
})
var db

//fetch('https://jsonplaceholder.typicode.com/todos/1')
fetch('http://192.168.2.79:8000')
  .then(response => response.json())
  .then(json => console.log(json))


/*
const MONGO_URL = 'mongodb://localhost:27017'
const db = await MongoClient.connect(MONGO_URL)
const Books = db.collection('books')*/

/*
console.log("************************************")
console.log("************************************")
console.log(Books)*/

// This is a (sample) collection of books we'll be able to query
// the GraphQL server for.  A more complete example might fetch
// from an existing data source like a REST API or database.
let book = [
  {
    _id: '5b60a0392fba65cdd96b1338',
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
  },
  {
    _id: '5b60a0392fba65cdd96b133b',
    title: 'Jurassic Park',
    author: 'Michael Crichton',
  },
];

const pubsub = new PubSub();
const SOMETHING_CHANGED_TOPIC = 'something_changed';

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  # Comments in GraphQL are defined with the hash (#) symbol.

  # This "Book" type can be used in other type declarations.
  type Book {
    _id: String
    title: String
    author: String
  }

  # The "Query" type is the root of all GraphQL queries.
  # (A "Mutation" type will be covered later on.)
  type Query {
    books: [Book],
    book(_id: String): Book,
    hello: String
  }

  type Subscription {
    bookAdded: Book
  }

  type Mutation {
    addBook(_id: String, title: String, author: String): Book,
  }
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  Query: {
    books: () => book,
    hello: () => 'world',
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator([SOMETHING_CHANGED_TOPIC]),
    },
  },
  Mutation: {
    addBook: (root, args) => {
      console.log(args)
      book.push({ _id: args._id, title: args.title, author: args.author })
      console.log(JSON.stringify(book))
      pubsub.publish(SOMETHING_CHANGED_TOPIC, { bookAdded: args });
      return { _id: args._id, title: args.title, author: args.author }
    }
  },
};

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
server.applyMiddleware({ app });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

MongoClient.connect("mongodb://localhost:27017/test", {useNewUrlParser: true }, (err, client) => {
  if (err) return console.log(err)
  db = client.db('test') // whatever your database name is

  db.collection('books').find().toArray(function(err, results) {
    console.log(results)
    // send HTML file populated with quotes here
  })

  /*
  app.listen(3000, () => {
    console.log('listening on 3000')
  })*/
  httpServer.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`),
  console.log(`🚀 Subscriptions ready at ws://localhost:4000${server.subscriptionsPath}`)
);
})


// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
/*server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});*/
