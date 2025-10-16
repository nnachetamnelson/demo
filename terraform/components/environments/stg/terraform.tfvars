function_name = "lambda-function-stg"
role_arn      = "arn:aws:iam::415649068772:role/lambda-gworks-heritage-stg-role"

lambda_options = {
  main = {
    owner            = "heritage"
    environment_name = "stg"
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
    subnet_ids         = [
      "subnet-00842419f552f0334", #stg private 1a
      "subnet-0c5f911bcfb3ff3d7", # main-stg-1a-internal-subnet
      "subnet-045236120930c8e62",  # main-stg-1b-internal-subnet
      "subnet-00338ece1998d81d2" #openvpn public access
    ]
    security_group_ids = [
      "sg-0195ba64a7f6bd78d", # stg-lambda-api-sg
      "sg-0cb833ef5cc5630b0",  # dbaccesssecuritygroup
      "sg-0c13cb275f2b85c51" #openvpn public access
    ]
    environment = {
      STAGE = "stg"
      AWS_LWA_ENABLE_DEBUG_LOGGING = "true"
    }
    tags = {
      Service = "heritage"
      Stage   = "stg"
    }
  }
}


external_image_digest = "sha256:66a737d21c8af84cbfe54b0154d55bc5e5bade82c02a80d5a6f4c6e5e42a1349"
enable_image_roll     = false


# Frontend (S3 + CloudFront)
enable_frontend      = true
frontend_bucket_name = "gworks-heritage-frontend-stg"
# Optional custom domain settings
# frontend_domain_name  = "app.stg.example.com"
# acm_certificate_arn   = "arn:aws:acm:us-east-1:ACCOUNT:certificate/XXXX"
# route53_hosted_zone_id = "ZAAAAAAAAAAAAA"





# API security and domain (Public but locked down)
disable_execute_api_endpoint = true

# If you want JWT auth (e.g., Cognito), enable and set issuer/audience
enable_jwt_authorizer = false
# jwt_issuer    = "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXXX"
# jwt_audiences = ["xxxxxxxxxxxxxxxxxxxxxxxxxx"]

# Restrict direct API invoke by IPs (resource policy) – optional
# api_allowed_source_cidrs = ["203.0.113.0/24", "198.51.100.10/32"]

# API custom domain (fronted by CloudFront). ACM must be in same region as API (us-east-1 here)
# api_domain_name           = "api.stg.example.com"
# api_acm_certificate_arn   = "arn:aws:acm:us-east-1:ACCOUNT:certificate/YYYY"
# api_route53_hosted_zone_id = "ZBBBBBBBBBBBBB"

# WAF for CloudFront
enable_waf        = true
waf_rate_limit    = 2000
waf_enable_aws_managed_rules = true