import express from 'express'
import { authentication } from '../middleware/authentication.js'
import { readFile, writeFile } from '../utils/functions.js'
import { checkKeys } from '../utils/functions.js'

export const userRouter = express()
userRouter.use(authentication)

const usersFile = './data/users.json'

userRouter.get('/', async (req, res)=> {
    const users = await readFile(usersFile)
    res.status(200).send(users)
})

userRouter.post('/', async (req, res) =>{
    const newUser = {}
    const keys = Object.keys(req.body)
    if (req.body && req.body.username && req.body.password && keys.length === 2){
        const username = req.body.username
        const password = req.body.password
        const users = await readFile(usersFile)
        for (const user of users) {
            if (user.username === username){
                return res.status(409).send(`User: '${username}' already exists`)
            }
        }
        newUser.username = username
        newUser.password = password
        users.push(newUser)
        await writeFile(usersFile, users)
        return res.status(200).send(`User: '${username}' Added successfully.`)
    } else {
        return res.status(422).send('Missing data')
    }
})

userRouter.put('/:username', async (req, res) => {
    const {username} = req.params
    const possiblekeys = ['newPassword']
    const keys = Object.keys(req.body)
    if (req.body && checkKeys(possiblekeys, keys)){
        const users = await readFile(usersFile)
        const newPassword = req.body.newPassword
        for (const user of users) {
            if (user.username === username){
                user.password = newPassword
                await writeFile(usersFile, users)
                return res.status(200).send(`Password changed successfully..`)
            }
        }
        return res.status(404).send(`User: '${username}' not found.`)
    } else {
        return res.status(422).send('Missing data')
    }
})

userRouter.delete('/:username', async (req, res) => {
    const {username} = req.params
    let users = await readFile(usersFile)
    for (const user of users) {
        if (user.username === username){
            users = users.filter((user) => {
                if (!(user.username === username)){
                    return true
                }
            })
            await writeFile(usersFile, users)
            return res.status(200).send(`User '${username}' deleted successfully.`)
        }
    }
    return res.status(404).send(`User: '${username}' not found.`)
})