import path from 'path'
import {app} from 'electron'
import fs from 'fs'

export default (err: any) => {
  fs.mkdirSync(path.join(app.getPath('userData'), 'logs'))
  const latest = path.join(app.getPath('userData'), 'logs', 'error.latest')
  const exact = path.join(
    app.getPath('userData'),
    'logs',
    `error_${new Date().getTime()}.latest`
  )

  const error = `${err}`
  fs.writeFileSync(latest, error)
  fs.writeFileSync(exact, error)
}
