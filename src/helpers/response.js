exports.sendCreated = function(res, message, data) {
  return res.status(201).send({
    success: true,
    message: message || 'Created',
    data: data || {}
  });
};

exports.sendBadRequest = function(res, message) {
  return res.status(400).send({
    success: false,
    message: message
  });
};

exports.sendUnauthorized = function(res, message) {
  return res.status(401).send({
    success: false,
    message: message
  });
};

exports.sendForbidden = function(res, message) {
  return res.status(403).send({ 
    success: false,
    message: message || 'You do not have rights to access this resource.'
  });
};

exports.sendNotFound = function(res, message) {
  return res.status(404).send({
    success: false,
    message: message || 'Resource not found.'
  });
};

exports.sendSuccess = function(res, message, data) {
  return res.status(200).send({
    success: true,
    message: message || 'Success',
    data: data
  });
};

exports.setHeadersForCORS = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, X-Access-Token, Content-Type, Accept");
  next();
}
