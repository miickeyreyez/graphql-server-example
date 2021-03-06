const fetch = require('node-fetch');
const http = require('http');
const { PubSub } = require('apollo-server');
const { ApolloServer, gql } = require('apollo-server-express');
var mongoose = require('mongoose');
var book = require('./books');
var bc = require('./bookController');
var app = require('./app');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
//const sequelize = new Sequelize('postgres://miguel.martinez:P0zTgr3z!@127.0.0.1:5432/test');
const sequelize = new Sequelize('test', 'miguel.martinez', 'P0zTgr3z!', {
  host: '127.0.0.1',
  dialect: 'postgres',
  operatorsAliases: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});
var exampleRestResponse = ''

sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
  //User.sync({force: true})
  User.create({
    firstName: 'John',
    lastName: 'Hancock'
  }).catch( err => {
    if(err) {
      console.log("LLAVE REPETIDA")
    }
  });

  User.create({
    firstName: 'HGHGHGH',
    lastName: 'BBBBBB'
  }).catch( err => {
    if(err) {
      console.log("LLAVE REPETIDA")
    }
  });

}).catch(err => {
  console.error('Unable to connect to the database:', err);
})

const User = sequelize.define('user', {
  firstName: {
    type: Sequelize.STRING,
    primaryKey: true,

  },
  lastName: {
    type: Sequelize.STRING
  }
});
console.log("INSERT")
console.log("*************************************************")
// force: true will drop the table if it already exists
debugger
/*.then(() => {
  // Table created
  return User.create({
    firstName: 'John',
    lastName: 'Hancock'
  });
});*/

/*
User.update({
  lastName: 'Hancock2',
}, {
  where: {
    id: 1
  }
});*/

console.log("GET")
console.log("*************************************************")
/* User.findAll().then(users => {
  console.log(users)
}) */
console.log("GET BY ID")
console.log("*************************************************")

/*
User.find({
  where: {
    id: 3
  }
}).then(results => {
  console.log("================")
  console.log(results)
  console.log("================")
});*/

/*
User.destroy({
  where: {
    id: 2
  }
});*/

fetch('https://jsonplaceholder.typicode.com/todos/1')
  .then(response => response.json())
  .then(json => console.log(json))

const pubsub = new PubSub();
const SOMETHING_CHANGED_TOPIC = 'something_changed';

const typeDefs = gql`
  # Comments in GraphQL are defined with the hash (#) symbol.

  # This "Book" type can be used in other type declarations.
  type Book {
    title: String
    author: String
    response: String
  }

  # The "Query" type is the root of all GraphQL queries.
  # (A "Mutation" type will be covered later on.)
  type Query {
    books: [Book],
    hello: String
  }

  type Subscription {
    bookAdded: Book
  }

  type Mutation {
    addBook(_id: String, title: String, author: String): Book,
  }
`;

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
      book.push({title: args.title, author: args.author })
     //console.log(JSON.stringify(book))
      pubsub.publish(SOMETHING_CHANGED_TOPIC, { bookAdded: args });
      fetch('https://jsonplaceholder.typicode.com/todos/1')
      .then(response => response.json())
      .then(json => {
        //console.log(json)
        //console.log(json.title)
        exampleRestResponse = json.title
        //console.log(exampleRestResponse)
        //bc.addBook(args.title, args.author)
        //bc.getBook('5b60a0392fba65cdd96b1338')
        //bc.getBooks()
        //bc.updateBooks('5b636cfc71d1320de3900c16', {title: args.title, author: args.author })
        bc.deleteBook('5b636d622c524c0df5ce5a98')
      }
      )
      return { title: args.title, author: args.author, response: exampleRestResponse }
    }
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app });
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`),
  console.log(`🚀 Subscriptions ready at ws://localhost:4000${server.subscriptionsPath}`)
  /*mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true }, (err, res) => {
  if (err) {
    throw err
  } else {
    console.log('La base de datos esta corriendo correctamente')
  }
  }),*/
)

User.findAll().then(users => {
  console.log(users)
})

