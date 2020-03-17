import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';


async function main() {
    let azPath = await io.which("az", true);


    const ressourceGroup = core.getInput('ressourceGroup')
    const templateFile = core.getInput('templateFile')

    /*
        az group deployment create --resource-group
                                [--aux-subs]
                                [--aux-tenants]
                                [--handle-extended-json-format]
                                [--mode {Complete, Incremental}]
                                [--name]
                                [--no-wait]
                                [--parameters]
                                [--rollback-on-error]
                                [--subscription]
                                [--template-file]
                                [--template-uri]
            */


    await executeAzureCliCommand(azPath, `group deployment create --resource-group ${ressourceGroup} --template-file ${templateFile}`)
}

async function executeAzureCliCommand(cliPath: string, command: string) {
    try {
        await exec.exec(`"${cliPath}" ${command}`, [], {});
    }
    catch (error) {
        throw new Error(error);
    }
}


main();