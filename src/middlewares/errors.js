function handleError(err, res) {
  const error = {
    type: err.type,
    message: err.message,
    errors: err.errors
  };
  // Console log error message in Red
  console.error('\x1b[31m', err);
  // Respond with status code 500 and return error
  const status = err.status || 500;
  res
    .header('Content-Type', 'application/json')
    .status(status)
    .send(JSON.stringify(error, null, 4));
}

module.exports = { handleError };