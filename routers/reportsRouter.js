import express from 'express'
import { authentication } from '../middleware/authentication.js'
import { readFile, writeFile } from '../utils/functions.js'
import { checkKeys } from '../utils/functions.js'


export const reportRouter = express()

const agentsFile = './data/agents.json'
const reportsFile = './data/reports.json'

reportRouter.get('/', async (req, res) => {
    const reports = await readFile(reportsFile)
    res.status(200).send(reports)
})

reportRouter.get('/:id', async (req, res) => {
    const {id} = req.params
    const reports = await readFile(reportsFile)
    for (const report of reports) {
        if (report.id == id){
            return res.status(200).send(report)
        }
    }
    return res.status(404).send(`report num: '${id}' is not found`)
})

reportRouter.post('/', authentication, async (req, res) => {
    const newReport = {}
    const keys = Object.keys(req.body)
    if (req.body && req.body.id && req.body.content && req.body.agentId && keys.length === 3){
        const id = req.body.id
        const content = req.body.content
        const agentId = req.body.agentId
        const reports = await readFile(reportsFile)
        const agents = await readFile(agentsFile)
        for (const report of reports) {
            if (report.id == id){
                return res.status(409).send(`ID: '${id}' already exists`)
            }
        }
        newReport.id = id
        newReport.date = new Date().toISOString()
        newReport.content = content
        for (const agent of agents) {
            if (agent.id == agentId){
                newReport.agentId = agentId
                reports.push(newReport)
                agent.reportsCount += 1
                await writeFile(reportsFile, reports)
                await writeFile(agentsFile, agents)
                return res.status(201).send(`report num. ${id} added successfully.`)
            } 
        }
        return res.status(409).send(`agentId: '${agentId}' is not found.`)
    } else {
        return res.status(422).send('Missing data')
    }
})

reportRouter.put('/:id', authentication, async (req, res) => {
    const {id} = req.params
    const reports = await readFile(reportsFile)
    const possiblekeys = ['content']
    const keys = Object.keys(req.body)
    if (req.body && checkKeys(possiblekeys, keys)){
        const content = req.body.content
        for (const report of reports) {
            if (report.id == id){
                if (content){
                    report.content = content
                }
                report.date = new Date().toISOString()
                await writeFile(reportsFile, reports)
                return res.status(200).send(`report num: '${id}' updated successfully.`)
            }
        }
        return res.status(404).send(`report num: '${id}' is not found`)
    } else {
        return res.status(422).send('Missing data')
    }
})

reportRouter.delete('/:id', authentication, async (req, res) => {
    const {id} = req.params
    let agents = await readFile(agentsFile)
    let reports = await readFile(reportsFile)
    for (const report of reports) {
        if (report.id == id){
            reports = reports.filter((report) => {
                if (!(report.id == id)){
                    return true
                }
            })
            for (const agent of agents) {
                if (agent.id == report.agentId){
                    agent.reportsCount -= 1
                }
            }
            await writeFile(agentsFile, agents)
            await writeFile(reportsFile, reports)
            return res.status(200).send(`report num: '${id}' deleted.`)
        }
    }
    return res.status(404).send(`report num: '${id}' is not found`)
})

