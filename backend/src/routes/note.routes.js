const express = require('express')

const router = express.Router()

const authMiddleware = require('../middleware/auth.middleware')
const {createNote, getNotes, getNoteById,updateNote, deleteNote} = require('../controllers/noteController')




router.post('/', authMiddleware, createNote)

router.get('/', authMiddleware, getNotes)

router.get('/:id', authMiddleware, getNoteById)

router.patch('/:id', authMiddleware, updateNote)

router.delete('/:id', authMiddleware,deleteNote)




module.exports = router