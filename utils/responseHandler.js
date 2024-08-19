// utils/responseHandler.js
export const handleResponse = (res, statusCode, data, success = true) => {
    res.status(statusCode).json({
        success,
        data,
        error: success ? null : data
    });
};
