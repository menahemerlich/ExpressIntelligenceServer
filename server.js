import express from 'express'
import { fileCheck } from './middleware/fileCheck.js'
import { userRouter } from './routers/userRouter.js'
import { agentRouter } from './routers/agentRouter.js'
import { reportRouter } from './routers/reportsRouter.js'

const app = express()
const PORT = process.env.PORT || 3030;

app.use(express.json())
app.use(fileCheck)
app.use('/users', userRouter)
app.use('/agents', agentRouter)
app.use('/reports', reportRouter)

app.get('/health', (req, res) => {
    res.status(200).json({"status":"ok", "serverTime": new Date().toISOString()})
})


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

