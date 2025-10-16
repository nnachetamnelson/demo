function_name = "lambda-function-dev"
role_arn      = "arn:aws:iam::415649068772:role/lambda-gworks-heritage-dev-role"

lambda_options = {
  main = {
    owner            = "heritage"
    environment_name = "dev"
    architecture = "x86_64"    # valid: "arm64" or "x86_64"
    repository       = "HeritageModule"
    controller       = "terraform"
    base_name        = "gworks"
    enable_logs           = true
    log_retention_in_days = 14
    repository_name = "heritage" # This is the ECR repository name
    image_tag       = "latest"
    timeout         = 30
    memory_size     = 1024
    # subnet_ids         = [
    #   "subnet-0707114b5c67e23da", # main-dev-1a-internal-subnet (private)
    #   "subnet-0faa7e57c0bc26866"  # RDS-Pvt-subnet-1 (private)
    # ]
    # security_group_ids = [
    #   "sg-01d545fa9bd881232",     # lambda-rds-2 (referenced by RDS SG ingress)
    #   "sg-081d8a328145195e4"      # devdbAccess (broad egress incl. DNS)
    # ]
    environment = {
      STAGE = "dev"
      AWS_LWA_ENABLE_DEBUG_LOGGING = "true"commit
    }
    tags = {
      Service = "heritage"
      Stage   = "dev"
    }
  }
}


# Frontend (S3 + CloudFront)
enable_frontend      = true
frontend_bucket_name = "gworks-heritage-frontend-dev"
# Optional custom domain settings
# frontend_domain_name  = "app.dev.example.com"
# acm_certificate_arn   = "arn:aws:acm:us-east-1:ACCOUNT:certificate/XXXX"
# route53_hosted_zone_id = "ZAAAAAAAAAAAAA"




