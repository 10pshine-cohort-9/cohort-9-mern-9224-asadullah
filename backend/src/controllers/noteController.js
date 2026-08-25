const noteModel = require('../models/Note');
const logger = require('../utils/logger');
const mongoose = require('mongoose')
const categoryModel = require('../models/Category');

const createNote = async (req, res, next) => {
  try {
    
    const { title, content, category } = req.body; 

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof content !== "string" ||
      !content.trim()
    ) {
      return res.status(400).json({
        message: "Title and content must be non-empty strings",
      });
    }

    const userId = req.user._id || req.user.userId || req.user.id;

    const note = await noteModel.create({
      title: title.trim(),
      content: content.trim(),
      category: category || null, 
      user: userId,
    });

    await note.populate("category", "name");

    logger.info(
      { noteId: note._id, userId: userId },
      "Note created successfully"
    );

    return res.status(201).json({
      message: "Note Created Successfully",
      note,
    });
  } catch (error) {
    next(error);
  }
};


const getNotes = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.userId || req.user.id;
    const { category, isArchived, isTrashed } = req.query;

    let query = {
      user: userId,
      
      isArchived: isArchived === "true",
      isTrashed: isTrashed === "true",
    };

    if (category) {
      query.category = category;
    }

    const notes = await noteModel
      .find(query)
      .populate("category", "name")
      .sort({ isPinned: -1, createdAt: -1 }); 

    logger.info(
      {
        userId: userId,
        count: notes.length,
      },
      "notes fetched successfully"
    );

    res.status(200).json({
      message: "notes fetched successfully",
      notes,
    });
  } catch (error) {
    next(error);
  }
};


const toggleNoteStatus = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.userId || req.user.id;
    const { id } = req.params;
    const { isPinned, isArchived, isTrashed } = req.body;

    const note = await noteModel.findOne({ _id: id, user: userId });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (typeof isPinned === "boolean") note.isPinned = isPinned;
    if (typeof isArchived === "boolean") note.isArchived = isArchived;
    if (typeof isTrashed === "boolean") note.isTrashed = isTrashed;

    await note.save();
    await note.populate("category", "name");

    res.status(200).json({
      message: "Note status updated successfully",
      note,
    });
  } catch (error) {
    next(error);
  }
};


const getNoteById = async (req, res, next) => {

    const noteId = req.params.id

    const user = req.user.userId

    try {

        if (!mongoose.isObjectIdOrHexString(noteId)) {
            return res.status(400).json({
                message: "Invalid note ID"
            })
        }


        const note = await noteModel.findOne({
            _id: noteId,
            user
        })


        if (!note) {
            return res.status(404).json({
                message: "note not found"
            });
        }

        logger.info("note found successfully")

        return res.status(200).json({ message: 'note found successfully', note })



    } catch (error) {

        next(error)

    }

}


const updateNote = async (req, res, next) => {
    const noteId = req.params.id
    const user = req.user.userId
    const { title, content, category } = req.body 

    try {
        if (!mongoose.isObjectIdOrHexString(noteId)) {
            return res.status(400).json({
                message: "Invalid note ID"
            })
        }

    
        if (title === undefined && content === undefined && category === undefined) {
            return res.status(400).json({
                message: "Provide at least one field to update"
            })
        }

        const updateData = {}

        if (title !== undefined) {
            if (typeof title !== 'string' || !title.trim()) {
                return res.status(400).json({
                    message: "Title must be a non-empty string"
                })
            }
            updateData.title = title.trim()
        }

        if (content !== undefined) {
            if (typeof content !== 'string' || !content.trim()) {
                return res.status(400).json({
                    message: "Content must be a non-empty string"
                })
            }
            updateData.content = content.trim()
        }

       
        if (category !== undefined) {
            if (category === "" || category === null || category === "no category") {
                updateData.category = null
            } else if (mongoose.isObjectIdOrHexString(category)) {
                updateData.category = category
            }
        }

     
        const updatedNote = await noteModel.findOneAndUpdate(
            {
                user,
                _id: noteId
            },
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).populate('category', 'name _id') 

        if (!updatedNote) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        logger.info(
            {
                noteId,
                userId: user
            },
            "Note updated successfully"
        )

        return res.status(200).json({
            message: "note Updated",
            note: updatedNote
        })

    } catch (error) {
        next(error)
    }
}



const deleteNote = async (req, res, next) => {

    const noteId = req.params.id

    const user = req.user.userId

    try {

        if (!mongoose.isObjectIdOrHexString(noteId)) {
            return res.status(400).json({
                message: "Invalid note ID"
            })
        }

        const deletedNote = await noteModel.findOneAndDelete({
            _id: noteId,
            user
        }
        )

        if (!deletedNote) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        logger.info('note deleted successfully')

        return res.status(200).json({
            message: "note deleted successfully",
        })



    } catch (error) {

        next(error)

    }




}


const bulkImportNotes = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const userId = req.user.userId;

    if (!Array.isArray(notes) || notes.length === 0) {
      return res.status(400).json({ message: "No notes provided for import" });
    }

    const userCategories = await categoryModel.find({ user: userId });

    const processedNotes = notes.map((note) => {
      let matchedCategoryId = null;

      if (note.categoryName) {
        const found = userCategories.find(
          (c) => c.name.toLowerCase() === note.categoryName.trim().toLowerCase()
        );
        if (found) matchedCategoryId = found._id;
      }

      return {
        title: note.title,
        content: note.content,
        user: userId,
        category: matchedCategoryId,
      };
    });

    const createdNotes = await noteModel.insertMany(processedNotes);

    const populatedNotes = await noteModel.populate(createdNotes, {
      path: "category",
      select: "name _id",
    });

    return res.status(201).json({
      message: `${populatedNotes.length} notes imported successfully`,
      notes: populatedNotes,
    });
  } catch (error) {
    next(error);
  }
};




const getTrashedNotes = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const trashedNotes = await noteModel
      .find({ user: userId, isTrash: true })
      .populate('category', 'name _id');

    return res.status(200).json({
      notes: trashedNotes
    });
  } catch (error) {
    next(error);
  }
};




module.exports = { createNote, getNotes, getNoteById, updateNote, deleteNote,toggleNoteStatus,bulkImportNotes,getTrashedNotes};