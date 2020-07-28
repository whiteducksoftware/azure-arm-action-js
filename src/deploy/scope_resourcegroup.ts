import { info } from '@actions/core';
import { Outputs, Parameters, Template } from '../utils/utils';
import { ResourceManagementClient, ResourceManagementModels } from '@azure/arm-resources';
import { v4 as uuidv4 } from 'uuid';

export async function DeployResourceGroupScope(client: ResourceManagementClient, resourceGroupName: string, location: string, template: Template, mode: ResourceManagementModels.DeploymentMode, deploymentName: string, parameters: Parameters): Promise<Outputs> {    
    // Check if resourceGroupName is set
    if (!resourceGroupName) {
        throw Error("ResourceGroup name must be set.")
    }

    // Create or update the resource group
    client.resourceGroups.createOrUpdate(resourceGroupName, { location })

    // generate deploymentName
    const uuid = uuidv4()
    const _deploymentName = `${deploymentName}-${uuid}`
    info(`Creating deployment ${deploymentName} with uuid ${uuid} -> ${_deploymentName}, mode: ${mode}`)

    // build deployment
    const deployment: ResourceManagementModels.Deployment = {
        properties: {
            mode,
            ...template,
            ...parameters
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