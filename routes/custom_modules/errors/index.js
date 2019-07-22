class AppError extends Error {
    constructor (message, status) {

        // Calling parent constructor of base Error class.
        super(message);

        // Saving class name in the property of our custom error as a shortcut.
        this.name = this.constructor.name;

        // Capturing stack trace, excluding constructor call from it.
        Error.captureStackTrace(this, this.constructor);

        // You can use any additional properties you want.
        // I'm going to use preferred HTTP status for this error types.
        // `500` is the default value if not specified.
        this.status = status || 500;

    }
}

const errorList = {
    AppError,
    NotLoggedIn: class extends AppError {
        constructor (message) {
            super(message || "You must be logged in to access this resource", 403);
        }
    },
    BadCredentials: class extends AppError {
        constructor (message) {
            super(message || "Incorrect credentials, please try again", 400);
        }
    },
};


module.exports = errorList;