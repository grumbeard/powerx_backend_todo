function handleError(err, res) {
  // Console log error message in Red
  console.error('\x1b[31m', err.message);
  // Respond with status code 500 and return error
  const status = err.status || 500;
  res
    .header('Content-Type', 'application/json')
    .status(status)
    .send(JSON.stringify(err, null, 4));
}

module.exports = { handleError };