import Review from "../models/reviewModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getAllReviews = asyncHandler(async(req, res, next) =>{
    const reviews = await Review.find();
    res.status(200).json({status: "success", data: reviews});
});

const createReview = asyncHandler(async(req, res, next) => {
    const {rating, review} = req.body;
    const newReview = await Review.createMany({
        rating, 
        review
    });
    res.status(201).json({
        status: "success",
        data: newReview
    });
});


const updateReview = asyncHandler(async(req,res,next)=> {
    const { id } = req.params;
    const { rating,review } = req.body;
    const updateReview = await Review.findByIdAndUpdate(
        id,
        {rating, review},
        {new: true,
        runValidators: true}
        );
        if (!updateReview){
            return res.status(404).json({
                status: "fail",
                message: "No review found"});
        }
        res.status(200).json({
            status: "success",
            data: updateReview
        });
    
});


const deleteReview = asyncHandler(async(req, res, next)=>{
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review){
        return res.status(404).json({
            status: "fail",
            message: "No review found"});
    }
    res.status(200).json({status: "success", data: review});
});

const getReviewByProductId = asyncHandler(async(req, res, next)=>{
    const reviews = await Review.find({product_id: {$eq: req.params.product_id}});
    res.status(200).json({
        status: "success", data: reviews
    });
})


export { getAllReviews, createReview, deleteReview, updateReview, getReviewByProductId};
