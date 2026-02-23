import app from '../app.ts'
import express from 'express'
import {
    index
} from './handlers.ts'



const loadViews = (_app: typeof app) => {    
    _app.get('/', index)

    return _app
}

export default loadViews
