# Challenge 3 solution - Robot Factory on Kalliopea Prime

Since we now need to _use_ the mined resources, it would be good to refactor our storage solution from Storage Tables to Cosmos DB. This way, we could make use of advanced features like triggers and stored procedures to notify the robot factory when enough material has been mined.

## 1. Install dependencies

```bash
cd Solution/api
npm install
```

## 2. Deploy resources with Terradform

This time I decided to go with a different approach for deploying resources by using Terraform. This way, I can define the infrastructure as code and deploy it with a single command.

First, you need to create a `terraform.tfvars` file with the following content:

```hcl
subscription_id = "00000000-0000-0000-0000-000000000000"    // your subscription id
region          = "westeurope"                              // the region to deploy to
app             = "avago-app"                               // prefix for your resources
env             = "dev"                                     // environment
location        = "we"                                      // short location name
```

```bash
cd ../Solution

# first, check that the configuration is correct
terraform plan

# if everything looks good, apply the configuration
terraform apply

```

After that, we just need to deploy the Azure Function code. Be sure to use the right function app name.

```bash
cd api
func azure functionapp publish avago-app-dev-we-functionapp
```

## 6. Cleanup

Once you are done, you can clean up the resources by running the following commands:

```bash
terraform destroy
```
