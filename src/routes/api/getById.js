const path = require('path');
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    const id = req.params.id.split('.')[0];
    const extension = path.extname(req.params.id);
    const fragment = await Fragment.byId(req.user, id);
    const data = await fragment.getData();

    if (extension) {
      const { newData, newType } = await fragment.convertTo(data, extension);
      if (!newData) {
        return res.status(415).json(createErrorResponse(415, 'Conversion type is unsupported'));
      }
      res.set('Content-Type', newType);
      res.status(200).send(newData);
    } else {
      res.set('Content-Type', fragment.type);
      res.status(200).send(data);
    }
  } catch (err) {
    return res.status(404).json(createErrorResponse(404, 'Fragment cannot be found'));
  }
};
