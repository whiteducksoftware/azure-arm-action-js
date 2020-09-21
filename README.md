# GitHub Action for Azure Resource Manager (ARM) deployment

##  archived

We did it 🎉🥳. Microsoft / GitHub decided to rehost our GitHub Action within the [official Azure repostory](https://github.com/Azure/arm-deploy). This means that this repository should no longer be used. 

--------

A GitHub Action to deploy ARM templates.

![build and publish](https://github.com/whiteducksoftware/azure-arm-action-js/workflows/build-release/badge.svg)

![white duck logo](img/wd-githubaction-arm.png?raw=true)

## Dependencies

* [Azure Login](https://github.com/Azure/login) Login with your Azure credentials
* [Checkout](https://github.com/actions/checkout) To checks-out your repository so the workflow can access any specified ARM template.

## Inputs

* `scope`: **Required** Provide the scope of the deployment. Valid values are: `resourcegroup`, `managementgroup`, `subscription`

* `subscriptionId` **Required** Provide the Id of the subscription which should be used.

* `location` Provide the target region, only required for Management Group or Subscription deployments.

* `resourceGroupName` Provide the name of a resource group.

* `templateLocation` **Required** Specify the path or URL to the Azure Resource Manager template.

* `deploymentMode` Incremental (only add resources to resource group) or Complete (remove extra resources from resource group). Default: `Incremental`.
  
* `deploymentName` Specifies the name of the resource group deployment to create.

* `parameters` Supply deployment parameter values or local as well as remote value files.   
  (See also [examples/Advanced.md](examples/Advanced.md))

* `managementGroupId` Specify the Id for the Management Group, only required for Management Group Deployments.

* `validationOnly` Whenether the template should only be validated or also deployed. Valid values are: `true`, `false`

## Outputs
Every template output will be exported as output. For example the output is called `containerName` then it will be available with `${{ steps.STEP.outputs.containerName }}`    
For more Information see [examples/Advanced.md](examples/Advanced.md).    

## Usage

```yml
- uses: whiteducksoftware/azure-arm-action-js@v4.1
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
    - uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
    - uses: whiteducksoftware/azure-arm-action-js@v4.1
      with:
        scope: resourcegroup
        subscriptionId: e1046c08-7072-****-****-************
        resourceGroupName: github-action-arm-rg
        templateLocation: ./azuredeploy.json
        parameters: storageAccountType=Standard_LRS
```
For more advanced workflows see [examples/Advanced.md](examples/Advanced.md).
