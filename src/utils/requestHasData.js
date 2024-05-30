const requestHasData = (req, res, next) => {
  const body = req.body;
  if (!body) next({
    status: 400,
    message: 'no body in request'
  });
  const data = body.data;
  if (!data) next({
    status: 400,
    message: 'no data in request body'
  });
  next()
};

module.exports = requestHasData;