export class NotInWorkspaceError extends Error {
    constructor(){
        super('You are not in a workspace, wkspace.json not found')
    }
}