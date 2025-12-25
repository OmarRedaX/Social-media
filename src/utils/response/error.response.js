
export const asyncHandler = (fn) => {

    return (req, res, next) => {
        return fn(req, res, next).catch(error=> {
            error.cause = 500;
            return next(error);
        })
    }

}


export const globalErrorHangling = (err, req, res, next) => {

    if(process.env.MOOD == "DEV") {
        return res.status(err.cause || 400).json({message: err.message, error: err, stack: err.stack});
    }

    return res.status(err.cause || 400).json({message: err.message, error: err});

}