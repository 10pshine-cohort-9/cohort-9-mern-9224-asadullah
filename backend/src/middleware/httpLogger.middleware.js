const logger = require('../utils/logger');

const httpLogger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const time = Date.now() - start;

        logger.info(
            {
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode,
                responseTime: `${time}ms`,
            },
            'http request complete'
        );
    });

    next();
};

module.exports = httpLogger;