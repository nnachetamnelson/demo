data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

data "aws_ecr_repository" "selected" {
  count = local.effective_image_uri == null && local.repository_name != null ? 1 : 0
  name  = local.repository_name
}

data "aws_ecr_image" "selected" {
  count           = local.effective_image_uri == null && local.repository_name != null ? 1 : 0
  repository_name = local.repository_name
  image_tag       = local.image_digest == null ? local.image_tag : null
  image_digest    = local.image_digest
}

locals {
  // Resolve exclusively from lambda_options
  effective_image_uri = try(local.options.image_uri, null)
  repository_name     = try(local.options.repository_name, null)
  image_tag           = try(local.options.image_tag, null)
  image_digest        = try(local.options.image_digest, null)

  resolved_image_uri = coalesce(
    local.effective_image_uri,
    local.repository_name != null ? (
      format(
        "%s.dkr.ecr.%s.amazonaws.com/%s@%s",
        data.aws_caller_identity.current.account_id,
        data.aws_region.current.id,
        local.repository_name,
        one(data.aws_ecr_image.selected[*].image_digest)
      )
    ) : null
  )
}
resource "aws_lambda_function" "this" {
  function_name = local.common.name
  description   = try(local.options.description, null)
  role          = var.role_arn

  package_type = "Image"
  image_uri    = local.resolved_image_uri

  lifecycle {
    # Workaround AWS provider update bug: avoid in-place image updates
    ignore_changes = [image_uri]
  }

  architectures = try(local.options.architecture, null) != null ? [local.options.architecture] : null
  timeout       = try(local.options.timeout, null)
  memory_size   = try(local.options.memory_size, null)

  dynamic "ephemeral_storage" {
    for_each = try(local.options.ephemeral_storage_size, null) != null ? [1] : []
    content {
      size = local.options.ephemeral_storage_size
    }
  }

  dynamic "image_config" {
    for_each = (
      try(local.options.image_config_command, null) != null ||
      try(local.options.image_config_entry_point, null) != null ||
      try(local.options.image_config_working_directory, null) != null
    ) ? [1] : []
    content {
      command           = local.options.image_config_command
      entry_point       = local.options.image_config_entry_point
      working_directory = local.options.image_config_working_directory
    }
  }

  dynamic "vpc_config" {
    for_each = try(local.options.subnet_ids, null) != null && try(local.options.security_group_ids, null) != null ? [1] : []
    content {
      subnet_ids         = local.options.subnet_ids
      security_group_ids = local.options.security_group_ids
    }
  }

  dynamic "environment" {
    for_each = try(local.options.environment, null) != null && length(local.options.environment) > 0 ? [1] : []
    content {
      variables = local.options.environment
    }
  }

  kms_key_arn = try(local.options.kms_key_arn, null)

  dynamic "tracing_config" {
    for_each = try(local.options.tracing_mode, null) != null ? [1] : []
    content {
      mode = local.options.tracing_mode
    }
  }

  reserved_concurrent_executions = try(local.options.reserved_concurrent_executions, null)

  tags = local.common.tags
}

resource "aws_cloudwatch_log_group" "this" {
  count             = try(local.options.enable_logs, null) == true ? 1 : 0
  name              = local.log_group_name
  retention_in_days = try(local.options.log_retention_in_days, null)
  kms_key_id        = try(local.options.kms_key_arn, null)

  tags = local.common.tags
}


