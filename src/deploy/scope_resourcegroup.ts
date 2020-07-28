import { info } from '@actions/core';
import { Outputs, Parameters, Template } from '../utils/utils';
import { ResourceManagementClient, ResourceManagementModels } from '@azure/arm-resources';
import { v4 as uuidv4 } from 'uuid';

export async function DeployResourceGroupScope(client: ResourceManagementClient, resourceGroupName: string, location: string, template: Template, mode: ResourceManagementModels.DeploymentMode, deploymentName: string, parameters: Parameters): Promise<Outputs> {    
    // Check if location is set
    if (!location) {
        throw Error("Location must be set.")
    }
    
    // Check if resourceGroupName is set
    if (!resourceGroupName) {
        throw Error("ResourceGroup name must be set.")
    }

    // Create or update the resource group
    client.resourceGroups.createOrUpdate(resourceGroupName, { location })

    // generate deploymentName
    const uuid = uuidv4()
    const _deploymentName = `${deploymentName}-${uuid}`
    info(`Creating deployment \x1b[32m${deploymentName}\x1b[0m with uuid \x1b[32m${uuid}\x1b[0m -> \x1b[32m${_deploymentName}\x1b[0m, mode: \x1b[32m${mode}\x1b[0m`)

    // build deployment
    const deployment: ResourceManagementModels.Deployment = {
        properties: {
            mode,
            ...template,
            ...parameters
        }
    }

    // validate the deployment
    info(`Validating deployment \x1b[32m${_deploymentName}\x1b[0m`)
    await client.deployments.validate(resourceGroupName, _deploymentName, deployment)
    info("Validation finished.")

    // execute the deployment
    info(`Creating deployment \x1b[32m${_deploymentName}\x1b[0m`)
    var response = await client.deployments.createOrUpdate(resourceGroupName, _deploymentName, deployment)
    info("Template deployment finished.")

    return response.properties?.outputs
}