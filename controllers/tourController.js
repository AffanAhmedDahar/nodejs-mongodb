const asyncHandler = require("express-async-handler");
const Tour = require('../model/tourModel');
// const { delete } = require('../routes/tourRoutes')

// const checkId = (req, res , next , val) => {
//     if(req.params.id *1 > tours.length) {
//         return res.status(404).json({
//             status : 'fails',
//             message : 'Invalid ID'
//         })
//     }
//     next();
// }

// const checkId = (req, res, next, val) => {
//     // console.log(`Tour id is: ${val}`);

//     if (req.params.id * 1 > tours.length) {
//       return res.status(404).json({
//         status: 'fail',
//         message: 'Invalid ID'
//       });
//     }
//     next();
//   };




const topTours = (req,res,next) => {
  req.query.limit = '5',
  req.query.sort = '-ratingsAverage,price',
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
  next()
}


class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

const getTours = async (req, res) => {
  try {
    // filtering
    // const queryObj = { ...req.query };
    // const excludeFields = ['page', 'sort', 'limit', 'fields'];
    // excludeFields.forEach((el) => delete queryObj[el]);

    // // advance filtering
    // let queryStr = JSON.stringify(queryObj); 
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // let query = Tour.find(JSON.parse(queryStr));

    // sorting
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   query = query.sort(sortBy);
    // } else {
    //   queryStr.sort('-creeatedAt');
    // }
    // field limiting 
    // if (req.query.fields){
    //   const fields = req.query.fields.split(',').join(' ')
    //   query = query.select(fields)
    // } else {
    //   query.select('-__v')
    // }

    // pagination 
    // const page = req.query.page * 1 ||  1 
    // const limit = req.query.limit * 1 || 10 
    // const skip = (page -1 ) * limit 

    // query = query.skip(skip).limit(limit)
    // if(req.query.page){
    //   const numTour = Tour.countDocuments()
    //   if(skip >= numTour){
    //     throw new Error('This ppage does not exits')
    //   }
    // }
    // excute

    const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate()
    const tour = await features.query;
    res.status(201).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

const getTour = asyncHandler( async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(201).json({
      status: 'success',
      data: {
    tour,
      },
    });
  } catch  {
    res.status(404)
    throw new Error('Tour not found')
  }
});

const addTours = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    console.log(newTour);
    res.status(200).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error,
    });
  }
};

const updateTour = asyncHandler( async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'succes',
      data: {
        tour,
      },
    });
  } catch  {
    res.status(404)
      throw new Error('tour not found with that id')
  }
});

const deleteTour = asyncHandler( async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (tour) {
      tour.remove();
    }
    res.status(200).json({
      status: 'succes',
      message: 'tour removed',
    });
  } catch (err) {
    res.status(404)
      throw new Error('tour not found with that id')
  }
});

const getTourStats = async (req, res) => {
  try {
  

    const stats = await Tour.aggregate([
     
      {
        $match: { ratingAverage: { $gte: 4.5 } }
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: { avgPrice: 1 }
      }
      
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

const  getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1; // 2021

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }
        }
      },
      {
        $addFields: { month: '$_id' }
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: { numTourStarts: -1 }
      },
      {
        $limit: 12
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};



module.exports = { addTours, getTour, getTours, updateTour, deleteTour , topTours , getTourStats , getMonthlyPlan};
