/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();
const bcrypt = require('bcrypt');
// const database = require('./database')


module.exports = (database) => {
  //display all resources
  //get data from the database
  //pass data to renderResources
  //limit function calls
  router.get('/', (req, res) => {
    res.send('homepage')
    database.getAllResources()
      .then(data => {
        const resources = data;
        console.log('resourcesssss', resources) //when does this happen???
        renderResources(resources)
        res.render({ resources });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  // Create a new user
  router.post('/', (req, res) => {
    const user = req.body;
    console.log('userrr', user)
    user.password = bcrypt.hashSync(user.password, 12);
    database.getUserByEmail(user.email)
    .then(existingUser => {
      if (existingUser) {
        res.send({ error: "email has been taken" });
        console.log('email already in use')
        return;
      }
      database.addUser(user)
      .then(newUser => {
        req.session.userId = newUser.id;
        res.send({ user: {email: user.email, id: user.id} });
      })
      console.log('New Account Created')
    })
      .catch(e => res.send(e));
  });

  // Logout
  router.get('/logout', (req, res) => {
    req.session.userId = null;
    res.redirect("/")
  });

  const login = function (email, password) {
    return database.getUserByEmail(email)
      .then(user => {
        try{

          if (user && bcrypt.compareSync(password, user.password)) {
            return user;
          }
        }catch(e){
          console.log('helpme', e)
        }
        throw new Error('Invalid User');
      })
  }

  router.post('/login', (req, res) => {
    const { email, password } = req.body;
    login(email, password)
      .then(user => {
        console.log('hellooo', user)
        if (!user) {
          res.send({ error: "error" });
          return;
        }
        req.session.userId = user.id;
        res.send({ user: { email: user.email, id: user.id } });
      })
      .catch(e => {
        res.status(404).send({ error: e.message })
      });
  });

  router.get("/myResources", (req, res) => {
    const userId = req.session.userId;
    console.log('userId', userId)
    if (!userId) {
      console.log(userId)
      res.redirect("/")
      // res.send({ message: "not logged in" });
      // return;
    }

    database.getUserById(userId)
      .then(user => {
        if (!user) {
          res.send({ error: "no user with that id" });
          return;
        }

        res.send({ user: { email: user.email, id: userId } });
      })
      .catch(e => res.send(e));
  });

  return router;
};
