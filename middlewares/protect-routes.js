function protectRoutes(req, res, next){
    if (!res.locals.isAuth){
        return res.redirect('/401');//this is the status code that shows the user is not authenticated
    }

    if (req.path.startsWith('/admin') && !res.locals.isAdmin){
        return res.redirect('/403');//this is the status code that shows the user is not admin ie. not authorized
    }//this checks if the user is searching for the url path that starts with /admin even if he/she is not the admin

    next();//so if the user is admin/authenticated then can go to the requested url using next()
}

module.exports = protectRoutes;