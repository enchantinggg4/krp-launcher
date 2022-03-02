import path from 'path'
import {app} from 'electron'
import fs from 'fs'
import iconv from "iconv-lite"

export default (err: any) => {
  const p = path.join(app.getPath('userData'), 'logs')
  if (!fs.existsSync(p)){
    fs.mkdirSync(p);
  }

  const latest = path.join(app.getPath('userData'), 'logs', 'error.latest')

  const error = `${err}`

  const encodings = [
    'utf-8',
    'ascii',
    'windows-1251',
    'windows-866'
  ];
  
  encodings.forEach(element => {
    const latest = path.join(app.getPath('userData'), 'logs', `error_${element}.latest`)
    try{
      fs.writeFileSync(latest, iconv.decode(err, element))
    }catch(e){}
  });
  
}
