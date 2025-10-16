variable "function_name" {
  description = "Lambda function name"
  type        = string
}

variable "role_arn" {
  description = "Pre-created IAM role ARN for Lambda execution"
  type        = string
}


variable "enable_frontend" {
  description = "Enable creation of S3/CloudFront frontend"
  type        = bool
  default     = false
}

variable "frontend_bucket_name" {
  description = "Name of the S3 bucket to host the frontend"
  type        = string
  default     = null
}

variable "frontend_domain_name" {
  description = "Optional custom domain for CloudFront (e.g., app.example.com)"
  type        = string
  default     = null
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN for the custom domain (in us-east-1 for CloudFront)"
  type        = string
  default     = null
}

variable "route53_hosted_zone_id" {
  description = "Route53 hosted zone ID for the custom domain"
  type        = string
  default     = null
}

variable "frontend_price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}

 
variable "lambda_options" {
  description = "Optional Lambda configuration as a map of objects; first entry is used."
  type = map(object({
    owner            = optional(string)
    environment_name = optional(string)
    repository       = optional(string)
    controller       = optional(string)
    base_name        = optional(string)
    name_override    = optional(string)
    tags             = optional(map(string))
    architecture                   = optional(string)
    description                    = optional(string)
    timeout                        = optional(number)
    memory_size                    = optional(number)
    ephemeral_storage_size         = optional(number)
    reserved_concurrent_executions = optional(number)
    subnet_ids         = optional(list(string))
    security_group_ids = optional(list(string))
    environment = optional(map(string))
    kms_key_arn = optional(string)
    enable_logs           = optional(bool)
    log_retention_in_days = optional(number)
    tracing_mode = optional(string)
    image_config_command           = optional(list(string))
    image_config_entry_point       = optional(list(string))
    image_config_working_directory = optional(string)
    repository_name = optional(string)
    image_tag       = optional(string)
    image_digest    = optional(string)
    image_uri       = optional(string)
  }))
}


variable "external_image_digest" {
  description = "Optional external image digest to construct image_uri and bypass ECR tag lookups"
  type        = string
  default     = null
}

variable "enable_image_roll" {
  description = "Enable optional image roll helper that updates Lambda via CLI when digest changes"
  type        = bool
  default     = false
}



# API hardening and domain settings
variable "disable_execute_api_endpoint" {
  description = "Disable the default execute-api endpoint (use custom domain + CloudFront)"
  type        = bool
  default     = false
}

variable "enable_jwt_authorizer" {
  description = "Enable HTTP API JWT authorizer and require JWT on routes"
  type        = bool
  default     = false
}

variable "jwt_issuer" {
  description = "JWT issuer URL (e.g., https://cognito-idp.<region>.amazonaws.com/<user_pool_id>)"
  type        = string
  default     = null
}

variable "jwt_audiences" {
  description = "List of JWT audiences (e.g., Cognito app client IDs)"
  type        = list(string)
  default     = []
}

variable "api_domain_name" {
  description = "Custom domain name for the HTTP API (e.g., api.example.com)"
  type        = string
  default     = null
}

variable "api_acm_certificate_arn" {
  description = "ACM certificate ARN for the API custom domain (same region as API)"
  type        = string
  default     = null
}

variable "api_route53_hosted_zone_id" {
  description = "Route53 hosted zone ID for the API custom domain"
  type        = string
  default     = null
}

variable "api_allowed_source_cidrs" {
  description = "Optional list of CIDRs to allow at API Gateway via resource policy (public APIs only)"
  type        = list(string)
  default     = []
}

# WAF settings for CloudFront
variable "enable_waf" {
  description = "Enable WAFv2 Web ACL and associate to CloudFront"
  type        = bool
  default     = false
}

variable "waf_rate_limit" {
  description = "Requests per 5 minutes per IP before blocking (WAF rate-based rule)"
  type        = number
  default     = 2000
}

variable "waf_enable_aws_managed_rules" {
  description = "Enable AWS managed rule sets (Common, KnownBadInputs, AnonymousIp, BotControl - lite)"
  type        = bool
  default     = true
}

