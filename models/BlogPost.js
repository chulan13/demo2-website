const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChapterSchema = new Schema({
  title: {type: String, required: true},
  content: {type: String, require: true}
})

const PostSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  email: {type: String, required: true},
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  chapters: [{ChapterSchema}]
});
// PostSchema.index({ email: 1, title: 1}, {unique: true});
module.exports = mongoose.model('Post', PostSchema);