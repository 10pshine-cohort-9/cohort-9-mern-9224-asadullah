const express = require('express')

const router = express.Router()

const authMiddleware = require('../middleware/auth.middleware')

const {createNote, getNotes, getNoteById,updateNote, deleteNote,toggleNoteStatus, bulkImportNotes, getTrashedNotes} = require('../controllers/noteController')




router.post('/', authMiddleware, createNote)

router.get('/', authMiddleware, getNotes)

router.get('/trash', authMiddleware, getTrashedNotes);

router.get('/:id', authMiddleware, getNoteById)

router.patch('/:id', authMiddleware, updateNote)

router.patch("/:id/status", authMiddleware, toggleNoteStatus);

router.delete('/:id', authMiddleware,deleteNote)

router.post('/bulk-import', authMiddleware, bulkImportNotes);






module.exports = router