const noteModel = require('../models/Note');
const logger = require('../utils/logger');
const mongoose = require('mongoose')



const createNote = async (req, res, next) => {

    try {


        const { title, content } = req.body

        if (!title || !content) return res.status(400).json({ message: 'fill empty fields' })

        const note = await noteModel.create({
            title,
            content,
            user: req.user.userId
        })

        logger.info({ noteId: note._id, userId: req.user.userId },
            'Note created successfully')

        return res.status(201).json({
            message: "Note Created Successfully",
            note
        })



    } catch (error) {

        next(error)

    }




}


const getNotes = async (req, res, next) => {
    try {

        const user = req.user.userId

        const notes = await noteModel.find({ user })


        logger.info({
            userId: user, count: notes.length

        },
            'notes fetched successfully'
        )

        res.status(200).json({
            message: "notes fetched successfully",
            notes
        })



    } catch (error) {

        next(error)
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

    const { title, content } = req.body

    try {

        if (!mongoose.isObjectIdOrHexString(noteId)) {
            return res.status(400).json({
                message: "Invalid note ID"
            })
        }

        if (!title && !content) return res.status(400).json({ message: "fill at least one field to update" })

        const updateData = {}

        if (title) {
            updateData.title = title;
        }

        if (content) {
            updateData.content = content;
        }

        const updateNote = await noteModel.findOneAndUpdate({
            user,
            _id: noteId
        },
            updateData,
            {
                new: true
            }
        )

        if (!updateNote) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        logger.info('note updated successfully')

        return res.status(200).json({
            message: "note Updated",
            note: updateNote
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


module.exports = { createNote, getNotes, getNoteById, updateNote, deleteNote };