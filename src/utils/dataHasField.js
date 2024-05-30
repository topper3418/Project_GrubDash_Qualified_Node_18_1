/**
 * Middleware function that checks if a specified field exists in the request body data.
 * If the field is missing and marked as mandatory, it will send a 400 error response.
 * If a validation function is provided and the field fails validation, it will also send a 400 error response.
 * If the field exists and passes validation, it will store the field value in the response locals object.
 * should always be preceeded by requestHasData
 * @param {string} field - The name of the field to check in the request body data.
 * @param {boolean} [mandatory=true] - Indicates whether the field is mandatory. Defaults to true.
 * @param {function} [validation=null] - Optional validation function to check the field value against.
 * @returns {function} - Express middleware function.
*/
const dataHasField = (field, failModes = {}) => {
  const { notFound, empty, validation } = failModes;
  return (req, res, next) => {
    const extractedField = req.body.data[field];
    if (extractedField === undefined && (notFound || empty)) next({
      status: 400,
      message: notFound || empty
    })
    if (!extractedField && empty) next({
      status: 400,
      message: empty
    });
    if (Array.isArray(validation)) validation.forEach(validationFunc => {
      const validationResults = validationFunc(extractedField);
      if (validationResults !== true) next(validationResults)
    }) 
    else if (validation) {
      const validationResults = validation(extractedField);
      if (validationResults !== true) next(validationResults)
    } 
    res.locals[field] = extractedField;
    next();
  };
};


module.exports = dataHasField;