// src/routes/api/get.js

//Successful and error response functions
const response = require('../../response');

/**
 * Get a list of fragments for the current user
 */
 module.exports = (req, res) => {
    // TODO: this is just a placeholder to get something working...
    res.status(200).json(response.createSuccessResponse({fragments: []}));
    /** 
    * Old version of sending response
    res.status(200).json({
      status: 'ok',
      fragments: [],
    });*/
  };