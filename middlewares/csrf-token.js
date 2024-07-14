function addCsrfToken(req, res, next) {
   res.locals.csrfToken = req.csrfToken();
   next();//once the above middleware is executed , the request for which it was executed is able to rich next middleware or route handler using this next() method
}//you can use any variable  res.locals.xyz but req.csrfToken() doesn't change

module.exports = addCsrfToken;