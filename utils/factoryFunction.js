const expressAsyncHandler = require("express-async-handler");


exports.deleteOne = Model =>  expressAsyncHandler( async (req, res) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (doc) {
        doc.remove();
      }
      res.status(200).json({
        status: 'succes',
        message: 'doc removed',
      });
    } catch (err) {
      res.status(404)
        throw new Error('doc not found with that id')
    }
  });