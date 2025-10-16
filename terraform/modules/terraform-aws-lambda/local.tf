locals {
  # Support map(object) input by taking the first element if provided
  options = length(keys(var.lambda_options)) > 0 ? var.lambda_options[one(keys(var.lambda_options))] : null

  owner            = try(local.options.owner, null)
  environment_name = try(local.options.environment_name, null)
  repository       = try(local.options.repository, null)
  controller       = try(local.options.controller, null)
  base_name_input  = try(local.options.base_name, null)
  name_override    = try(local.options.name_override, null)

  base_name  = coalesce(local.base_name_input, var.function_name)
  name_parts = compact([local.base_name, local.owner, local.environment_name])

  # Filter out null tag values
  base_tags = {
    owner       = local.owner
    environment = local.environment_name
    controller  = local.controller
  }
  filtered_base_tags = { for k, v in local.base_tags : k => v if v != null }

  common = {
    name = coalesce(local.name_override, join("-", local.name_parts))
    tags = merge(
      local.filtered_base_tags,
      local.repository != null ? { repository = local.repository } : {},
      coalesce(try(local.options.tags, null), {})
    )
  }

  log_group_name = "/aws/lambda/${local.common.name}"
}



