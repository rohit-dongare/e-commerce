function handleErrors(error, req, res, next){
    console.log(error);

    if (error.code === 404) {
        return res.status(404).render('shared/404');
    }

    //server side error
    res.status(500).render('shared/500');//here the 500.ejs file is in shared called folder
}

module.exports = handleErrors;