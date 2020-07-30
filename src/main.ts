import { DeployResourceGroupScope, ValidateResourceGroupScope } from './deploy/scope_resourcegroup';
import { DeployManagementGroupScope, ValidateManagementGroupScope } from './deploy/scope_managementgroup';
import { DeploySubscriptionScope, ValidateSubscriptionScope } from './deploy/scope_subscription';
import { getInput, info } from '@actions/core';
import { ResourceManagementClient, ResourceManagementModels } from '@azure/arm-resources';
import { Outputs, ReadTemplate, ReadParameters } from './utils';
import * as msRestNodeAuth from "@azure/ms-rest-nodeauth";
import { v4 as uuidv4 } from 'uuid';

type SDKAuth = {
	clientId: string
	clientSecret: string
	subscriptionId: string
	tenantId: string
}

type Scope = 'resourcegroup' | 'managementgroup' | 'subscription'

// Action Main code
export async function main(): Promise<Outputs> {
    // retrieve action variables
    const scope = getInput('scope') as Scope
    const credentials = JSON.parse(getInput(`credentials`)) as SDKAuth
    const location = getInput('location')
    const resourceGroupName = getInput('resourceGroupName')
    const templateLocation = getInput('templateLocation')
    const deploymentMode = getInput('deploymentMode') as ResourceManagementModels.DeploymentMode
    const deploymentName = getInput('deploymentName')
    const parameters = getInput('parameters')
    const overrideParameters = getInput('overrideParameters')
    const managementGroupdId = getInput('managementGroupId')
    const validationOnly = getInput('validationOnly') == 'true';

    // Parse the inputs
    const template = ReadTemplate(templateLocation)
    const mergedParameters = { parameters: { ...ReadParameters(parameters).parameters, ...ReadParameters(overrideParameters).parameters } }

    // retrive the credentials
    const creds = await msRestNodeAuth.loginWithServicePrincipalSecret(credentials.clientId, credentials.clientSecret, credentials.tenantId)
    const client = new ResourceManagementClient(creds, credentials.subscriptionId);

    // build properties
    const deploymentProperties: ResourceManagementModels.DeploymentProperties = {
        mode: deploymentMode,
        ...template,
        ...mergedParameters
    }

    // generate deploymentName
    const uuid = uuidv4()
    const _deploymentName = `${deploymentName}-${uuid}`
    info(`Deployment \x1b[32m${deploymentName}\x1b[0m with uuid \x1b[32m${uuid}\x1b[0m -> \x1b[32m${_deploymentName}\x1b[0m, mode: \x1b[32m${ validationOnly ? "Validation" : deploymentMode }\x1b[0m`)

    // Validate the Deployment
    switch(scope) {
        case "resourcegroup":
            await ValidateResourceGroupScope(client, resourceGroupName, _deploymentName, deploymentProperties)
            break
        case "managementgroup":
            await ValidateManagementGroupScope(client, managementGroupdId, location, _deploymentName, deploymentProperties)
            break
        case "subscription":
            await ValidateSubscriptionScope(client, location, _deploymentName, deploymentProperties)
            break
        default:
            throw new Error("Invalid scope. Valid values are: 'resourcegroup', 'managementgroup', 'subscription'")
    }

    // Run the Deployment
    if (!validationOnly) {
        switch(scope) {
            case "resourcegroup":
                return DeployResourceGroupScope(client, resourceGroupName, location, _deploymentName, deploymentProperties)
            case "managementgroup":
                return DeployManagementGroupScope(client, managementGroupdId, location, _deploymentName, deploymentProperties)
            case "subscription":
                return DeploySubscriptionScope(client, location, _deploymentName, deploymentProperties)
            default:
                throw new Error("Invalid scope. Valid values are: 'resourcegroup', 'managementgroup', 'subscription'")
        }
    }

    return {}
}