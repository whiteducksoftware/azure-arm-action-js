import { info } from '@actions/core';
import { Outputs, ParseJsonFile, ParseParametersJsonFile } from '../utils/utils';
import { ResourceManagementClient, ResourceManagementModels } from '@azure/arm-resources';
import { v4 as uuidv4 } from 'uuid';

export async function DeployManagementGroupScope(client: ResourceManagementClient, mangedmentGroupId: string, location: string, templateLocation: string, deploymentMode: ResourceManagementModels.DeploymentMode, deploymentName: string, parametersLocation: string): Promise<Outputs> {    
    // Check if location is set
    if (!location) {
        throw Error("Location must be set.")
    }
    
    // generate deploymentName
   const uuid = uuidv4()
   const _deploymentName = `${deploymentName}-${uuid}`
   info(`Creating deployment ${deploymentName} with uuid ${uuid} -> ${_deploymentName}, mode: ${deploymentMode}`)

    // build deployment
    const deployment: ResourceManagementModels.ScopedDeployment = {
        location,
        properties: {
            mode: deploymentMode,
            ...(templateLocation.startsWith("http") ? { templateLink: { uri: templateLocation } } : { template: ParseJsonFile(templateLocation) }),
            ...(parametersLocation.startsWith("http") ? { parametersLink: { uri: parametersLocation } } : { parameters: ParseParametersJsonFile(parametersLocation) })
        }
    }
    console.log(deployment)
    // validate the deployment
    info(`Validating deployment ${_deploymentName}`)
    await client.deployments.validateAtManagementGroupScope(mangedmentGroupId, _deploymentName, deployment)
    info("Validation finished.")

    // execute the deployment
    info(`Creating deployment ${_deploymentName}`)
    var response = await client.deployments.createOrUpdateAtManagementGroupScope(mangedmentGroupId, _deploymentName, deployment)
    info("Template deployment finished.")

    return response.properties?.outputs
}