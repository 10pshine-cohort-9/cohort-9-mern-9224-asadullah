const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    isPinned: { 
      type: Boolean, default: false 
    },
    isArchived: {
       type: Boolean, default: false
       },
    isTrashed: {
       type: Boolean, default: false 
      }
  },

  {
    timestamps: true,
  }
);


const Note = mongoose.model('Note', noteSchema)

module.exports = Note