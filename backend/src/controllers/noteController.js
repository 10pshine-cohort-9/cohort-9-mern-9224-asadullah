const noteModel = require('../models/Note');
const logger = require('../utils/logger');
const mongoose = require('mongoose')
const categoryModel = require('../models/Category');



const createNote = async (req, res, next) => {
  try {
    const { title, content, category, tags } = req.body;
    const userId = req.user.userId;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (category) {
      const categoryExists = await Category.exists({ _id: category, user: userId });
      if (!categoryExists) {
        return res.status(400).json({ message: "Invalid or unauthorized category" });
      }
    }

    const note = await Note.create({
      title: title.trim(),
      content,
      category: category || null,
      tags: tags || [],
      user: userId,
    });

    if (category) {
      await note.populate("category", "name");
    }

    res.status(201).json({
      message: "Note created successfully",
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
  try {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;
    const userId = req.user.userId;

    if (category) {
      const categoryExists = await Category.exists({ _id: category, user: userId });
      if (!categoryExists) {
        return res.status(400).json({ message: "Invalid or unauthorized category" });
      }
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category || null;
    if (tags !== undefined) updateData.tags = tags;

    const note = await Note.findOneAndUpdate(
      { _id: id, user: userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.category) {
      await note.populate("category", "name");
    }

    res.status(200).json({
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    next(error);
  }
};



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