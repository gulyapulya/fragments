// src/routes/api/get.js

//Successful and error response functions
const response = require('../../response');
const { Fragment } = require('../../model/fragment');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    let expand = req.query.expand && req.query.expand === '1' ? true : false;
    const fragments = await Fragment.byUser(req.user, expand);
    res.status(200).json(response.createSuccessResponse({ fragments }));
  } catch (err) {
    res.status(401).json(response.createErrorResponse(401, err));
  }
};
