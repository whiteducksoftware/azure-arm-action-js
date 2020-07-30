# GitHub Action for Azure Resource Manager (ARM) deployment

A GitHub Action to deploy ARM templates.

![build and publish](https://github.com/whiteducksoftware/azure-arm-action-js/workflows/build-release/badge.svg)

![white duck logo](img/wd-githubaction-arm.png?raw=true)

## Dependencies

* [Azure Login](https://github.com/Azure/login) Login with your Azure credentials
* [Checkout](https://github.com/actions/checkout) To checks-out your repository so the workflow can access any specified ARM template.

## Inputs

* `scope`: **Required** Provide the scope of the deployment. Valid values are: `resourcegroup`, `managementgroup`, `subscription`

* `credentials` **Required** Paste output of `az ad sp create-for-rbac -o json`.

* `location` Provide the target region. 

* `resourceGroupName` Provide the name of a resource group.

* `templateLocation` **Required** Specify the path or URL to the Azure Resource Manager template.

* `deploymentMode` Incremental (only add resources to resource group) or Complete (remove extra resources from resource group). Default: `Incremental`.
  
* `deploymentName` Specifies the name of the resource group deployment to create.

* `parameters` Supply either the path to the Azure Resource Manager parameters file or pass them as Key-Value Pairs. 
  (See also [examples/Advanced.md](examples/Advanced.md))

* `overrideParameters` Specify either the path to the Azure Resource Manager override parameters file or pass them as Key-Value Pairs.  
  (See also [examples/Advanced.md](examples/Advanced.md))

* `managementGroupId` Specify the Id for the Management Group, only required for Management Group Deployments.

* `validationOnly` Specify whenether the template should only be validated or also deployed. Valid values are: 'true', 'false'

## Outputs
Every template output will be exported as output. For example the output is called `containerName` then it will be available with `${{ steps.STEP.outputs.containerName }}`    
For more Information see [examples/Advanced.md](examples/Advanced.md).    

## Usage

```yml
- uses: whiteducksoftware/azure-arm-action-js@v3
  with:
    scope: resourcegroup
    subscriptionId: <YourSubscriptionId>
    resourceGroupName: <YourResourceGroup>
    templateLocation: <path/to/azuredeploy.json>
```

## Example

```yml
on: [push]
name: AzureLoginSample

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@master
    - uses: whiteducksoftware/azure-arm-action-js@v3
      with:
        scope: resourcegroup
        credentials: ${{ secrets.AZURE_CREDENTIALS }}
        resourceGroupName: github-action-arm-rg
        templateLocation: ./azuredeploy.json
        parameters: ./parameters.json
```
For more advanced workflows see [examples/Advanced.md](examples/Advanced.md).