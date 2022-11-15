const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    res.status(404).json(createErrorResponse(404, err));
  }
};
