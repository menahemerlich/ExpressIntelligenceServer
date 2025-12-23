import { createFile } from "../utils/functions.js";

const usersFile = './data/users.json'
const agentsFile = './data/agents.json'
const reportsFile = './data/reports.json'

const files = [usersFile, agentsFile, reportsFile]

export async function fileCheck(req, res, next) {
    for (const file of files) {
        await createFile(file)
    }
    next()
}
