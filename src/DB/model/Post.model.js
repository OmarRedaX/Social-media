import mongoose, {Schema , model , Types} from 'mongoose';

const PostSchema = new Schema({

    content: { type: String,
         minlength: 2,
         maxlength: 5000,
         trim: true,
         required: function(){
            return this.attachments?.length ? false : true;
         } },

    attachments: [{ secure_url: String, public_id: String }],
    likes: [{ type: Types.ObjectId, ref: 'User' }],
    // comments:[{type: Types.ObjectId, ref:'Comment'}],
    tags: [{ type: Types.ObjectId, ref: 'User' }],
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
    deletedBy: { type: Types.ObjectId, ref: 'User' },
    isDeleted: Date,
    archived: {type: Boolean , default: false}

},{ timestamps: true, toJSON:{virtuals:true}, toObject:{virtuals:true}});


// hooks 
PostSchema.post("findOneAndUpdate", async function (doc) {
    
    if(doc && doc?.isDeleted ){
        await model("Comment").updateMany(
            {postId: doc._id},
            {isDeleted: Date.now() , deletedBy: doc.deletedBy},
            {new: true}
        )
    };
});



PostSchema.virtual('comments', {
    localField:'_id',
    foreignField:'postId',
    ref:'Comment',
    // justOne:true
})

export const postModel = mongoose.models.Post || model('Post', PostSchema);