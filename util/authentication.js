//session will be created when user logs in
function createUserSession(req, user, action){
    req.session.uid = user._id.toString();//as the id of the user in database is in Object ID format
    req.session.isAdmin = user.isAdmin;//isAdmin is the key flag added to the only specific users in database explicitly , 
                              //this flag either can be undefined(not every user can have this property attached with them in database) or true

     req.session.save(action);
}

//session will be destroyed for the user when the user logout thats why we make user id equal to null
//that means if the user has no session id (it is actually nothing but the  id of the user from the database when he sign up his unique id is created in database to store it's info) then he is not authenticated
function destroyUserAuthSession(req) {
    req.session.uid = null;
    req.session.isAdmin = false;
}

module.exports = {
    createUserSession: createUserSession,
    destroyUserAuthSession: destroyUserAuthSession
};