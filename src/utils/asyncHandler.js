const asyncHandler = (resultHandler) => {
  return (req, res, next) => {
    Promise.resolve(resultHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
