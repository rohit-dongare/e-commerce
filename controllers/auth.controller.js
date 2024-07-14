const User = require("../models/user.model");
const authUtil = require("../util/authentication");
const validation = require("../util/validation");
const sessionFlash = require("../util/session-flash");//sessions can be also used when you are submitting form
//consider you entered wrong email or password or put empty field and try to submit in this case page will be refreshed and you have to fill the fields again 
//but if you use to store data i.e input field data then you don't have to reenter every input field

function getSignup(req, res) {
  //first go through signup function where we stored data into session and then here in this function we are getting that session data
  let sessionData = sessionFlash.getSessionData(req);

  //initially all the input fields are empty
  //here the keys should match with the keys we are passing into session data 
  if (!sessionData) {
     sessionData = {
       email: '',
       confirmEmail: '',
       password: '',
       fullname: '',
       street: '',
       postal: '',
       city: ''
     };
  }

  res.render("customer/auth/signup", { inputData: sessionData });
}



async function signup(req, res, next) {

  const enteredData = {
   email: req.body.email,
   confirmEmail: req.body['confirm-email'],
   password: req.body.password,
   fullname: req.body.fullname,
   street: req.body.street,
   postal: req.body.postal,
   city: req.body.city
  };

  //checking if the data put by the user in input field is valid or not
  if (
    !validation.userDetailsAreValid(
      req.body.email,
      req.body.password,
      req.body.fullname,
      req.body.street,
      req.body.postal,
      req.body.city
    ) ||
    !validation.emailIsConfirmed(req.body.email, req.body['confirm-email'])
  ) { 
    sessionFlash.flashDataToSession(req, {
      errorMessage: 
         'Please check your input. Password must be at least 6 characters long, postal code must be 5 characters long',
      ...enteredData
    }, 
    function(){
      res.redirect('/signup');
    }
  )
    
    return;
  }

  const user = new User(
    req.body.email,
    req.body.password,
    req.body.fullname,
    req.body.street,
    req.body.postal,
    req.body.city
  );


  try {
    const existsAlready = await user.existsAlready();//if he/she wants to signup with the email address which already exists in database which is not valid 
   
    if (existsAlready) {
      sessionFlash.flashDataToSession(req, {
        errorMessage: 'User exists already , try logging in instead!',
        ...enteredData
      }, 
      function(){
        res.redirect('/signup');
      }
     );
      
      return;
    }

  //storing user info in database when he/she signs up with valid credentials
    await user.signup();

  } catch (error) {
    next(error); //if the error occurs then it will go to default error handling middleware i.e error-handler.js file where we have use 500 type error
    return;
  }

  res.redirect('/login'); //you usually redirect when you request for post request because if we use render then when refresh the page he will get popup whether he wants to resubmit the form
}


//login page
function getLogin(req, res) {
  let sessionData = sessionFlash.getSessionData(req);

  //initially email field and password field are empty
  //here the keys of the object in getLogin() should match with the keys of the object which we are passing to the session in login() method
  //at line no 133
  if (!sessionData) {
     sessionData = {
       email: '',
       password: ''
     };
  }

  res.render("customer/auth/login", { inputData: sessionData });
}


//login form submission
async function login(req, res, next) {
  //checking if email entered is exist in database or not
  const user = new User(req.body.email, req.body.password); //even this fuction has 6 parameters so other 4 paramters will be undefined
  let existingUser;
  try {
    existingUser = await user.getUserWithSameEmail();
  } catch (error) {
    next(error); //if the error occurs then it will go to default error handling middleware i.e error-handler.js file where we have use 500 type error
    return;
  }

  const sessionErrorData = {
    errorMessage: 'Invalid credentials - please double-check your email and password.',
    email: user.email,
    password: user.password
  };

  if (!existingUser) {
    sessionFlash.flashDataToSession(req, sessionErrorData, function(){
      res.redirect('/login');
    });
    
    return;
  }

  //checking if password entered is matcing or not
  //we don't handle the errors for the below line using try-catch as the compairing the passwords won't create any error
  //here we pass hashed password from the database which is compared with entered password
  const passwordIsCorrect = await user.hasMatchingPassword(existingUser.password);

  if (!passwordIsCorrect) {
    sessionFlash.flashDataToSession(req, sessionErrorData, function(){
      res.redirect("/login");
    });

    return;
  }

  //creating sessions and storing some data into the session for authentication purpose
  authUtil.createUserSession(req, existingUser, function () {
    res.redirect("/");
  });
}



function logout(req, res) {
  authUtil.destroyUserAuthSession(req);
  res.redirect("/login");
}


module.exports = {
  getSignup: getSignup,
  signup: signup,
  getLogin: getLogin,
  login: login,
  logout: logout,
};
