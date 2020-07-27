import { exec } from '@actions/exec';
import { ExecOptions } from '@actions/exec/lib/interfaces';
import { ParseOutputs } from '../utils';

export async function DeploySubscriptionScope(azPath: string, location: string,  templateLocation: string, deploymentMode: string, deploymentName: string, parameters: string): Promise<boolean> {    
    // create the parameter list
    const azDeployParameters = [
        location ? `--location ${location}` : undefined,
        templateLocation ?
            templateLocation.startsWith("http") ? `--template-uri ${templateLocation}`: `--template-file ${templateLocation}`
        : undefined,
        deploymentMode ? `--mode ${deploymentMode}` : undefined,
        deploymentName ? `--name ${deploymentName}` : undefined,
        parameters ? `--parameters ${parameters}` : undefined
    ].filter(Boolean).join(' ');

    // configure exec to write the json output to a buffer
    let commandOutput = '';
    const options: ExecOptions = {
        listeners: {
            stdline: (data: string) => {
                if (!data.startsWith("[command]"))
                    commandOutput += data;
                // console.log(data);
            },   
        }
    }

    // validate the deployment
    await exec(`"${azPath}" deployment sub validate ${azDeployParameters} -o json`, [], options);

    // execute the deployment
    await exec(`"${azPath}" deployment sub create ${azDeployParameters} -o json`, [], options);

    // Parse the Outputs
    return ParseOutputs(commandOutput)
}