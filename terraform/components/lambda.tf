locals {
  # If external_image_digest is provided, construct a full image_uri that the module will consume directly.
  # This bypasses ECR tag lookups in the module.
  account_id   = data.aws_caller_identity.current.account_id
  region       = data.aws_region.current.id
  repo_name    = try(var.lambda_options["main"].repository_name, null)
  image_digest = var.external_image_digest

  external_image_uri = (
    local.repo_name != null && local.image_digest != null ?
    format("%s.dkr.ecr.%s.amazonaws.com/%s@%s", local.account_id, local.region, local.repo_name, local.image_digest) :
    null
  )
}



module "lambda_service" {
  source        = "../modules/terraform-aws-lambda"
  function_name = var.function_name
  role_arn      = var.role_arn

  lambda_options = merge(
    var.lambda_options,
    local.external_image_uri != null ? {
      main = merge(
        var.lambda_options["main"],
        { image_uri = local.external_image_uri }
      )
    } : {}
  )
}



