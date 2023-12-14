const asynchandling = (RequestHandler) => {
  return (req, res, next) => {
    Promise.resolve(RequestHandler(req, res, next)).catch((err) => next(err));
  };
};
export { asynchandling };
