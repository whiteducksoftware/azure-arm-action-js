import { info } from '@actions/core';
import { Outputs, ParseJsonFile, ParseParametersJsonFile } from '../utils/utils';
import { ResourceManagementClient, ResourceManagementModels } from '@azure/arm-resources';
import { v4 as uuidv4 } from 'uuid';

export async function DeployResourceGroupScope(client: ResourceManagementClient, resourceGroupName: string, location: string, templateLocation: string, deploymentMode: ResourceManagementModels.DeploymentMode, deploymentName: string, parametersLocation: string): Promise<Outputs> {    
    // Check if resourceGroupName is set
    if (!resourceGroupName) {
        throw Error("ResourceGroup name must be set.")
    }

    // Create or update the resource group
    client.resourceGroups.createOrUpdate(resourceGroupName, { location })

    // generate deploymentName
    const uuid = uuidv4()
    const _deploymentName = `${deploymentName}-${uuid}`
    info(`Creating deployment ${deploymentName} with uuid ${uuid} -> ${_deploymentName}, mode: ${deploymentMode}`)

    // build deployment
    const deployment: ResourceManagementModels.Deployment = {
        properties: {
            mode: deploymentMode,
            ...(templateLocation.startsWith("http") ? { templateLink: { uri: templateLocation } } : { template: ParseJsonFile(templateLocation) }),
            ...(parametersLocation.startsWith("http") ? { parametersLink: { uri: parametersLocation } } : { parameters: ParseParametersJsonFile(parametersLocation) })
        }
    }

    // validate the deployment
    info(`Validating deployment ${_deploymentName}`)
    await client.deployments.validate(resourceGroupName, _deploymentName, deployment)
    info("Validation finished.")

    // execute the deployment
    info(`Creating deployment ${_deploymentName}`)
    var response = await client.deployments.createOrUpdate(resourceGroupName, _deploymentName, deployment)
    info("Template deployment finished.")

    return response.properties?.outputs
}