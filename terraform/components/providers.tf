terraform {
  required_version = ">= 1.4.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
  backend "s3" {}
}

provider "aws" {
  region = var.lambda_options["main"].environment != null && contains(keys(var.lambda_options["main"].environment), "AWS_REGION") ? var.lambda_options["main"].environment["AWS_REGION"] : (var.lambda_options["main"].environment_name != null && var.lambda_options["main"].environment_name == "stg" ? "us-east-1" : "us-east-1")
}