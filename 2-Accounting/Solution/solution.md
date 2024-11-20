# Challenge 2 solution

## 1. Install dependencies

```bash
npm install
```

## 2. Test locally

Run the Azure functions locally by running the following command:

```bash
cd api

npm start
```

Then test the Next.js app locally by running the following command:

```bash

cd ../webapp

npm run dev
```

## 3. Create Azure resources

This project is based on the challenge 1 resources, so create those resources first.

```bash
resourceGroup=avago-rg
location=westeurope
storageAccount=avagostorage$RANDOM
functionAppName=avago-miner-app
appservicePlan=avago-plan
webappName=avago-webapp

# Challenge 1 resources
az group create --name $resourceGroup --location $location

az storage account create --name $storageAccount --location $location --resource-group $resourceGroup --sku Standard_LRS

az functionapp create --resource-group $resourceGroup --consumption-plan-location $location --runtime node --runtime-version 20 --functions-version 4 --name $functionAppName --storage-account $storageAccount

# run this inside /api folder
func azure functionapp publish $functionAppName

# New resources for webapp

az appservice plan create --name $appservicePlan --resource-group $resourceGroup --location $location --sku P0V3 --is-linux

az webapp create --name $webappName --resource-group $resourceGroup --plan $appservicePlan --runtime "NODE:20-lts"

# set automatic build upon deployment and the API_HOST environment variable
az webapp config appsettings set --name $webappName --resource-group $resourceGroup --settings SCM_DO_BUILD_DURING_DEPLOYMENT=true API_HOST=https://$functionAppName.azurewebsites.net
```

## 4. Deploy to Azure

Deploy the application to Azure from your local environment by running the following command:

```bash
az webapp up --name $webappName --resource-group $resourceGroup --plan $appservicePlan --location $location --runtime "NODE:20-lts"

```

## 5. Setup scaling and health checks

Since the accountants want a more resilient application, we need to set up scaling and health checks for the web app.

```bash
# scale to 2 instances
az appservice plan update --name $appservicePlan --resource-group $resourceGroup --number-of-workers 2

## enable health checks
az webapp config set --name $webappName --resource-group $resourceGroup --generic-configurations '{"healthCheckPath":"/"}'
```

## 6. Cleanup

Verify that everything is working and that you can reach your website.

Once you are done, you can clean up the resources by running the following commands:

```bash
az group delete --name $resourceGroup --yes --no-wait
```

## Troubleshooting

In case you get some permissions issues when trying to access the Storage Table, make sure your account (or the managed identity for the app) has access to the Storage Account. You can do this by running the following command (replace the placeholders with your values):

```bash
az role assignment create --role "Storage Table Data Contributor" --assignee <your-username> --scope /subscriptions/<subscription-id>/resourceGroups/<resource-group>/providers/Microsoft.Storage/storageAccounts/<storage-account>
```
