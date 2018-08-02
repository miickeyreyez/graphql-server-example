'use strict'
var Book = require('./book');

function addBook(title, author) {
    var book = new Book();
    book.title = title
    book.author = author
    book.save((err, saved) => {
        if(err) {
            console.log("Error al guardar el libro")
        } else {
            console.log(saved)
        }
    })
}

function getBook(id) {
    Book.findById(id, (err, book) => {
        if(err) {
            console.log("Error al obtener el libro")
        } else {
            console.log(book)
        }
    })
}

function getBooks() {
    Book.find((err, books) => {
        if(err) {
            console.log("Error al obtener los libros")
        } else {
            console.log(books)
        }
    })
}

function updateBooks(id, update) {
    Book.findByIdAndUpdate(id, update, (err, bookUpdate) => {
        if(err) {
            console.log("Error al actualizar el libro")
        } else {
            console.log(bookUpdate)
        }
    })
}

function deleteBook(id) {
    Book.findByIdAndRemove(id, (err, bookDeleted) => {
        if(err) {
            console.log("Error al eliminar el libro")
        } else {
            console.log(bookDeleted)
        }
    })
}
module.exports = {
    addBook,
    getBook,
    getBooks,
    updateBooks,
    deleteBook
}