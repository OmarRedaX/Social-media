import mongoose, {Schema , model , Types} from 'mongoose';

const commentSchema = new Schema({

    content: { type: String,
         minlength: 2,
         maxlength: 5000,
         trim: true,
         required: function(){
            return this.attachments?.length ? false : true;
         } },

    attachments: [{ secure_url: String, public_id: String }],
    likes: [{ type: Types.ObjectId, ref: 'User' }],
    tags: [{ type: Types.ObjectId, ref: 'User' }],
    postId: { type: Types.ObjectId, ref: 'Post', required: true },
    commentId:{type: Types.ObjectId, ref: 'Comment'},
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
    deletedBy: { type: Types.ObjectId, ref: 'User' },
    isDeleted: Date

},{ timestamps: true,toJSON:{virtuals:true}, toObject:{virtuals:true}});

commentSchema.virtual('replys', {
    localField:'_id',
    foreignField:'commentId',
    ref:'Comment'
})

export const commentModel = mongoose.models.Comment || model('Comment', commentSchema);