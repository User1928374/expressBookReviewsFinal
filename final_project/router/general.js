const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if(!username || ! password){
      return res.status(400).json({message: "Username and Password are required"});
    }

    const userExists = users.some(user => user.username === username);
    if(userExists){
      return res.status(409).json({message: "User already Exists"});
    }

    users.push({ username, password });
    return res.status(200).json({message: "User registered successfully"});
});

public_users.get('/', async (req, res) => {
    try {
        const allBooks = await getBooks();
        res.status(200).send(JSON.stringify(allBooks, null, 4));
    } catch (error) {
        res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

const getBooks = async () => {
    return new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject(new Error("Books not found"));
        }
    });
};

// Get book details based on ISBN
const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject('Book not found');
        }
    });
};

public_users.get('/isbn/:isbn', async function (req, res) {
    const ISBN = req.params.isbn;

    try {
        const book = await getBookByISBN(ISBN);
        res.send(book);
    } catch (error) {
        res.status(404).send({ message: error });
    }
});

  
// Get book details based on author
const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
        const filteredBooks = Object.values(books).filter(book => book.author === author);
        if (filteredBooks.length > 0) {
            resolve(filteredBooks);
        } else {
            reject('No books found by author');
        }
    });
};

public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;

    try {
        const booksByAuthor = await getBooksByAuthor(author);
        res.send(JSON.stringify(booksByAuthor, null, 4));
    } catch (error) {
        res.status(404).send({ message: error});
    }
});

const getBookByTitle = (title) => {
    return new Promise((resolve, reject) => {
        const bookFound = Object.values(books).filter(book => book.title === title);

        if (bookFound.length > 0) {
            resolve(bookFound);
        } else {
            reject("No books found with this title");
        }
    });
};

public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
  
    try {
        const bookByTitle = await getBookByTitle(title); 
        res.send(JSON.stringify(bookByTitle, null, 4));
    } catch (error) {
        res.status(404).send({ message: error }); 
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const ISBN = req.params.isbn;
    res.send(JSON.stringify(books[ISBN].reviews));
});

module.exports.general = public_users;
