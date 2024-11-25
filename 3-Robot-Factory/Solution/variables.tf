variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
}
variable "region" {
  description = "Azure infrastructure region"
  type        = string
  default     = "westeurope"
}

variable "app" {
  description = "Application that we want to deploy"
  type        = string
}

variable "env" {
  description = "Application env"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Location short name"
  type        = string
  default     = "we"
}