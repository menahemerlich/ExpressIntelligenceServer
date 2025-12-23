import express from 'express'
import { authentication } from '../middleware/authentication.js'
import { readFile, writeFile } from '../utils/functions.js'

export const agentRouter = express()

const agentsFile = './data/agents.json'
const reportsFile = './data/reports.json'

agentRouter.get('/', async (req, res) => {
    const agents = await readFile(agentsFile)
    res.status(200).send(agents)
})

agentRouter.get('/:id', async (req, res) => {
    const {id} = req.params
    const agents = await readFile(agentsFile)
    for (const agent of agents) {
        if (agent.id == id){
            return res.status(200).send(agent)
        }
    }
    return res.status(404).send(`agent num: '${id}' is not found`)
})

agentRouter.post('/', authentication, async (req, res) =>{
    const newAgent = {}
    if (req.body && req.body.id && req.body.name && req.body.nickname){
        const id = req.body.id
        const name = req.body.name
        const nickname = req.body.nickname
        const agents = await readFile(agentsFile)
        for (const agent of agents) {
            if (agent.id === id){
                return res.status(409).send(`ID: '${id}' already exists`)
            }
        }
        newAgent.id = id
        newAgent.name = name
        newAgent.nickname = nickname
        newAgent.reportsCount = 0
        agents.push(newAgent)
        await writeFile(agentsFile, agents)
        return res.status(201).send(`Agent num. ${id} added successfully.`)
    } else {
        return res.status(422).send('Missing data')
    }
})

agentRouter.put('/:id', authentication, async (req, res) => {
    const {id} = req.params
    const agents = await readFile(agentsFile)
    if (req.body && (req.body.name || req.body.nickname)){
        const name = req.body.name
        const nickname = req.body.nickname
        for (const agent of agents) {
            if (agent.id == id){
                if (name){
                    agent.name = name
                }
                if (nickname){
                    agent.nickname = nickname
                }
                await writeFile(agentsFile, agents)
                return res.status(200).send(`agent num: '${id}' updated successfully.`)
            }
        }
        return res.status(404).send(`agent num: '${id}' is not found`)
    } else {
        return res.status(422).send('Missing data')
    }
})

agentRouter.delete('/:id', authentication, async (req, res) => {
    const {id} = req.params
    let agents = await readFile(agentsFile)
    let reports = await readFile(reportsFile)
    for (const agent of agents) {
        if (agent.id == id){
            agents = agents.filter((agent) => {
                if (!(agent.id == id)){
                    return true
                }
            })
            reports = reports.filter((report) => {
                if (!(report.agentId == id)){
                    return true
                }
            })
            await writeFile(agentsFile, agents)
            await writeFile(reportsFile, reports)
            return res.status(200).send(`Agent num: '${id}' deleted, all reports from agentId num: '${id}' is deleted.`)
        }
    }
    return res.status(404).send(`agent num: '${id}' is not found`)
})