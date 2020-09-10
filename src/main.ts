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
    const commitFiles = core.getInput('committed_files', { required: true });
    const failure: boolean =
      (core.getInput('throw_error') || 'true').toUpperCase() === 'TRUE'
    const fileList: string[] = files
      .split(',')
      .map((item: string) => item.trim())
    const commitList = commitFiles
      .replace(/[\[\]']+/gi, '')
      .split(',')
      .filter(function(e){return e})
      .map((item) => item.trim());
    const restrictedFiles: string[] = []
    const path = require('path')

    // Check in parallel
    await Promise.all(
      commitList.map(async (file: string) => {
        //const isPresent = await checkExistence(file)
        const regexFile = file.replace(/\"+/gi, '');
        core.info(`File: ${file}`);
        core.info(`Filename: ${path.basename(regexFile)}`);
        //core.info(`IsPresent: ${isPresent}`);
        core.info(`Filetype: ${path.extname(file)}`);
        core.info(`Include: ${fileList.includes(path.extname(file))}`);	
        if (fileList.includes(path.extname(regexFile))) {
          restrictedFiles.push(file)
        }
      })
    )

    if (restrictedFiles.length > 0) {
      if (failure) {
        core.setFailed(`These files are prohibited: ${restrictedFiles.join(', ')}`)
      } else {
        core.info(`These files are prohibited: ${restrictedFiles.join(', ')}`)
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
