import { asyncHandler } from '../utils/asyncHandler.js';
import { APIError } from '../utils/apiError.js';
import { APIFeatures } from '../utils/apiFeatures.js';

const getResourceName = (Model) => Model.modelName.toLowerCase();

export const getAll = (Model) =>
  asyncHandler(async (req, res, next) => {
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const docs = await features.query;
    const resourceName = `${getResourceName(Model)}s`; // Pluralize for collections

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        [resourceName]: docs,
      },
    });
  });

export const getOne = (Model, popOptions) =>
  asyncHandler(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (req.query?.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    }
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    const resourceName = getResourceName(Model);

    if (!doc) {
      return next(new APIError(`No ${resourceName} found with that ID`, 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        [resourceName]: doc,
      },
    });
  });

export const createOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.create(req.body);
    const resourceName = getResourceName(Model);

    res.status(201).json({
      status: 'success',
      data: {
        [resourceName]: doc,
      },
    });
  });

export const updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });
    const resourceName = getResourceName(Model);

    if (!doc) {
      return next(new APIError(`No ${resourceName} found with that ID`, 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        [resourceName]: doc,
      },
    });
  });

export const deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    const resourceName = getResourceName(Model);

    if (!doc) {
      return next(new APIError(`No ${resourceName} found with that ID`, 404));
    }

    res.sendStatus(204);
  });
