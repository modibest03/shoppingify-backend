import Item from '../models/itemsModel.js';
import History from '../models/historyModel.js';
import cloudinary from '../utils/cloudinary.js';

export const addItem = async (req, res, next) => {
  try {
    let result;
    const { _id } = req.user;
    const { name, category, note } = req.body;

    if (req.file) {
      result = await cloudinary.uploader.upload(req.file.path, {
        public_id: 'shoppingify',
      });
    }

    const item = await Item.create({
      name,
      category,
      note,
      userId: _id,
      image: result.secure_url,
    });

    res.status(201).json({
      message: 'success',
      data: {
        item,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getItems = async (req, res, next) => {
  try {
    const { _id } = req.user;

    const items = await Item.find({ userId: _id });

    res.status(200).json({
      message: 'success',
      data: {
        items,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getItem = async (req, res, next) => {
  try {
    try {
      const { _id } = req.user;

      const item = await Item.findOne({ userId: _id, _id: req.params.id });

      res.status(200).json({
        message: 'success',
        data: {
          item,
        },
      });
    } catch (err) {
      next(err);
    }
  } catch (err) {
    next(err);
  }
};
