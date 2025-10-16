variable "function_name" {
  description = "Lambda function name"
  type        = string
}

variable "role_arn" {
  description = "Pre-created IAM role ARN for Lambda execution"
  type        = string
}

 
variable "lambda_options" {
  type = map(object({
    # Naming
    owner            = optional(string)
    environment_name = optional(string)
    repository       = optional(string)
    controller       = optional(string)
    base_name        = optional(string)
    name_override    = optional(string)

    # Tags
    tags = optional(map(string))

    # Runtime/Lambda
    architecture                   = optional(string)
    description                    = optional(string)
    timeout                        = optional(number)
    memory_size                    = optional(number)
    ephemeral_storage_size         = optional(number)
    reserved_concurrent_executions = optional(number)

    # VPC
    subnet_ids         = optional(list(string))
    security_group_ids = optional(list(string))

    # Environment
    environment = optional(map(string))
    kms_key_arn = optional(string)

    # Logging
    enable_logs           = optional(bool)
    log_retention_in_days = optional(number)

    # Tracing
    tracing_mode = optional(string)

    # Image config
    image_config_command           = optional(list(string))
    image_config_entry_point       = optional(list(string))
    image_config_working_directory = optional(string)

    # ECR resolution
    repository_name = optional(string)
    image_tag       = optional(string)
    image_digest    = optional(string)

    # Direct URI (if provided, overrides ECR inputs)
    image_uri = optional(string)
  }))
  description = "Optional Lambda configuration as a map of objects; first entry is used."
}
 



