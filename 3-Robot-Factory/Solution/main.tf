# Configure the Azure provider
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.5.0"
    }
  }

  required_version = ">= 1.1.0"
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

locals {
  stack                = "${var.app}-${var.env}-${var.location}"
  storage_account_name = "avago${var.env}${var.location}"

  default_tags = {
    environment = var.env
    owner       = "A.Vago"
    app         = var.app
  }

}

resource "azurerm_resource_group" "resource_group" {
  name     = "${local.stack}-rg"
  location = var.region

  tags = local.default_tags
}

resource "azurerm_storage_account" "storage_account" {
  name                     = "${local.storage_account_name}storage"
  resource_group_name      = azurerm_resource_group.resource_group.name
  location                 = azurerm_resource_group.resource_group.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = local.default_tags
}

resource "azurerm_application_insights" "app_insights" {
  name                = "${local.stack}-app-insights"
  resource_group_name = azurerm_resource_group.resource_group.name
  location            = azurerm_resource_group.resource_group.location
  application_type    = "web"

  tags = local.default_tags
}

resource "azurerm_cosmosdb_account" "cosmosdb" {
  name                = "${local.stack}-cosmosdb"
  location            = azurerm_resource_group.resource_group.location
  resource_group_name = azurerm_resource_group.resource_group.name
  offer_type          = "Standard"

  consistency_policy {
    consistency_level = "Session"
  }

  geo_location {
    location          = azurerm_resource_group.resource_group.location
    failover_priority = 0
  }

  tags = local.default_tags

  capabilities {
    name = "EnableServerless"
  }
}

resource "azurerm_cosmosdb_sql_database" "cosmosdb_sql_database" {
  name                = "${local.stack}-cosmosdb-sql-db"
  resource_group_name = azurerm_resource_group.resource_group.name
  account_name        = azurerm_cosmosdb_account.cosmosdb.name
}

resource "azurerm_servicebus_namespace" "servicebus_namespace" {
  name                = "${local.stack}-servicebus-namespace"
  location            = azurerm_resource_group.resource_group.location
  resource_group_name = azurerm_resource_group.resource_group.name
  sku                 = "Standard"

  tags = local.default_tags
}

resource "azurerm_servicebus_queue" "servicebus_queue" {
  name         = "${local.stack}-servicebus-queue"
  namespace_id = azurerm_servicebus_namespace.servicebus_namespace.id

}

resource "azurerm_service_plan" "functionapp_service_plan" {
  name                = "${local.stack}-functionapp-service-plan"
  resource_group_name = azurerm_resource_group.resource_group.name
  location            = azurerm_resource_group.resource_group.location
  os_type             = "Linux"
  sku_name            = "Y1"

  tags = local.default_tags
}

resource "azurerm_linux_function_app" "functionapp" {
  name                = "${local.stack}-functionapp"
  resource_group_name = azurerm_resource_group.resource_group.name
  location            = azurerm_resource_group.resource_group.location

  storage_account_name       = azurerm_storage_account.storage_account.name
  storage_account_access_key = azurerm_storage_account.storage_account.primary_access_key
  service_plan_id            = azurerm_service_plan.functionapp_service_plan.id



  site_config {
    application_stack {
      node_version = "20"
    }

    application_insights_connection_string = azurerm_application_insights.app_insights.connection_string
    application_insights_key = azurerm_application_insights.app_insights.instrumentation_key

   
  }

   app_settings = {
      COSMOSDB_DATABASE_NAME     = azurerm_cosmosdb_sql_database.cosmosdb_sql_database.name
      COSMOSDB_CONNECTION_STRING = azurerm_cosmosdb_account.cosmosdb.primary_sql_connection_string
      SERVICEBUS_CONNECTION_STRING = azurerm_servicebus_namespace.servicebus_namespace.default_primary_connection_string
      SERVICEBUS_QUEUE_NAME = azurerm_servicebus_queue.servicebus_queue.name
    }

  tags = local.default_tags
}

