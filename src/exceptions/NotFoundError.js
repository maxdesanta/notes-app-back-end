const ClientError = require("./ClientError")

class NotFoundError extends ClientError { 
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
    }
};

module.exports = NotFoundError;