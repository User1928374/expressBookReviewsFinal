const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
    return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const {username, password} = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    if (!isValid(username)) {
        return res.status(400).json({ message: "Username does not exist." });
    }


    if (!authenticatedUser(username, password)) {
        return res.status(400).json({ message: "Invalid username or password." });
    }

    const accessToken = jwt.sign({ username: username }, 'token', { expiresIn: 60 * 60 });

    req.session.authorization = { accessToken, username };

    // Send success response
    return res.status(200).json({ message: "Login successful"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const ISBN = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization.username;

    if(!review){
        return res.status(400).json({ message: "Please write a review"});
    }

    if(!books[ISBN]){
        return res.status(409).json({ message: "Enter a valid book ISBN"});
    }

    if(!books[ISBN].reviews){
        books[ISBN].reviews = {};
    }

    books[ISBN].reviews[username] = review;

    return res.status(200).json({ message: "Book review added"});

});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const ISBN = req.params.isbn;
    const username = req.session.authorization.username;

    if (!books[ISBN]) {
        return res.status(409).json({ message: "Please enter valid book" });
    }

    if (!books[ISBN].reviews || !books[ISBN].reviews[username]) {
        return res.status(404).json({ message: "No review found to delete for this user" });
    }

    delete books[ISBN].reviews[username];

    return res.status(200).json({ message: "Book review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
