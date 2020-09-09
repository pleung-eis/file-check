import * as core from '@actions/core'
import fs from 'fs'

async function checkExistence(path: string): Promise<boolean> {
  try {
    await fs.promises.access(path)
  } catch (error) {
    return false
  }
  return true
}

async function run(): Promise<void> {
  try {
    const files: string = core.getInput('files', {required: true})
    const commitFiles = core.getInput('commitFiles', { required: true });
    const failure: boolean =
      (core.getInput('allow_failure') || 'false').toUpperCase() === 'TRUE'
    const fileList: string[] = files
      .split(',')
      .map((item: string) => item.trim())
//    const restrictlist: string[] = searchFiles
//      .split(',')
//      .map((item: string) => item.trim())
    const commitList = commitFiles
        .replace(/[\[\]']+/gi, '')
        .split(','
        .map((item) => item.trim());
    const missingFiles: string[] = []
    const path = require('path')

    // Check in parallel
    await Promise.all(
      commitList.map(async (file: string) => {
        const isPresent = await checkExistence(file)
        core.info(`File: ${file}`);
        core.info(`IsPresent: ${isPresent}`);
        core.info(`Filetype: ${path.extname(file)}`);
        core.info(`Include: ${fileList.includes(path.extname(file))}`);	
        if (isPresent && fileList.includes(path.extname(file))) {
          missingFiles.push(file)
        }
      })
    )

    if (missingFiles.length > 0) {
      if (failure) {
        core.setFailed(`These files are prohibited: ${missingFiles.join(', ')}`)
      } else {
        core.info(`These files are prohibited: ${missingFiles.join(', ')}`)
      }
      core.setOutput('files_exists', 'false')
    } else {
      core.info('🎉 No prohibited file types found!')
      core.setOutput('files_exists', 'true')
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
