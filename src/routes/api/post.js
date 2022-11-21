const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  if (!Buffer.isBuffer(req.body) || !Fragment.isSupportedType(req.get('Content-Type'))) {
    return res.status(415).json(createErrorResponse(415, 'This type is not supported'));
  }

  try {
    const api_url = process.env.API_URL
      ? process.env.API_URL
      : `http://localhost:${process.env.PORT}`;
    const fragment = new Fragment({ ownerId: req.user, type: req.get('Content-Type') });
    await fragment.save();
    await fragment.setData(req.body);

    res.setHeader('Location', `${api_url}/v1/fragments/${fragment.id}`);
    res.status(201).json(createSuccessResponse({ fragment }));
  } catch (error) {
    res.status(400).json(createErrorResponse(400, error));
  }
};
