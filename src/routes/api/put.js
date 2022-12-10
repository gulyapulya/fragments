const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    if (req.get('content-type') != fragment.type) {
      res.status(400).json(createErrorResponse(400, 'Type should not be changed after creation'));
      return;
    }

    fragment.setData(req.body);

    const api_url = process.env.API_URL ? process.env.API_URL : `http://localhost:8080`;
    res.setHeader('Location', `${api_url}/v1/fragments/${fragment.id}`);
    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    res.status(404).json(createErrorResponse(404, err));
  }
};
