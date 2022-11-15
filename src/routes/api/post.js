const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  if (!Buffer.isBuffer(req.body) || !Fragment.isSupportedType(req.get('Content-Type'))) {
    console.log('WORKS!!!!');
    return res.status(415).json(createErrorResponse(415, 'This type is not supported'));
  }

  try {
    const fragment = new Fragment({ ownerId: req.user, type: req.get('Content-Type') });
    await fragment.save();
    await fragment.setData(req.body);

    res.setHeader('Location', `${process.env.API_URL}/v1/fragments/${fragment.id}`);
    res.status(201).json(createSuccessResponse({ fragment }));
  } catch (error) {
    res.status(415).json(createErrorResponse(415, error));
  }
};
