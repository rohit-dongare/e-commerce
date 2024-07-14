
//first go through authentication.js file
function checkAuthStatus(req, res, next) {
    const uid = req.session.uid;//the session will have the user id if the is login because when he/she login 
     //in authenication.js file we have called createUserSession() method where we store the user id from the database into the session

    if (!uid) {
        return next();
    }

    res.locals.uid = uid;
    res.locals.isAuth = true;//this means user has logged in with valid credentials
    if (req.session.isAdmin){
        res.locals.isAdmin = true;
    }
    next();
}

module.exports = checkAuthStatus;