const findEntry = (data, dataName = "data") => {
    return (req, res, next) => {
        const { id } = req.params;
        const foundEntry = data.find((item) => item.id == id);
        if (foundEntry === undefined) {
            next({
                status: 404,
                message: `no matches found in ${dataName} for id: ${id}`,
            });
        } else {
          res.locals.foundEntry = foundEntry;
          next();
        }
    };
};

module.exports = findEntry;
