import app from './app.ts'


// error handler

app.listen(5000, () => {
    console.log('listening on port 5000')
})

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});