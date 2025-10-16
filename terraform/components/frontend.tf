locals {
  environment_name = try(var.lambda_options["main"].environment_name, "dev")
}

resource "aws_s3_bucket" "frontend" {
  count  = var.enable_frontend ? 1 : 0
  bucket = var.frontend_bucket_name

  tags = merge(
    try(var.lambda_options["main"].tags, {}),
    {
      Service = "heritage-frontend"
      Stage   = local.environment_name
    }
  )
}

resource "aws_s3_bucket_ownership_controls" "frontend" {
  count  = var.enable_frontend ? 1 : 0
  bucket = aws_s3_bucket.frontend[0].id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  count = var.enable_frontend ? 1 : 0
  bucket = aws_s3_bucket.frontend[0].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_cloudfront_origin_access_control" "frontend" {
  count                             = var.enable_frontend ? 1 : 0
  name                              = "heritage-frontend-oac-${local.environment_name}"
  description                       = "OAC for Heritage frontend S3 origin (${local.environment_name})"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "frontend" {
  count = var.enable_frontend ? 1 : 0

  enabled             = true
  comment             = "Heritage frontend (${local.environment_name})"
  default_root_object = "index.html"

  aliases = var.frontend_domain_name != null && var.frontend_domain_name != "" ? [var.frontend_domain_name] : []

  origin {
    domain_name = aws_s3_bucket.frontend[0].bucket_regional_domain_name
    origin_id   = "s3-${aws_s3_bucket.frontend[0].id}"

    origin_access_control_id = aws_cloudfront_origin_access_control.frontend[0].id
  }

  # API Gateway origin to route /api/* via same domain
  origin {
    domain_name = var.api_domain_name != null && var.api_domain_name != "" ? var.api_domain_name : replace(aws_apigatewayv2_api.heritage_api.api_endpoint, "https://", "")
    origin_id   = "apigw-${aws_apigatewayv2_api.heritage_api.id}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "s3-${aws_s3_bucket.frontend[0].id}"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  # Route API requests to API Gateway origin (no caching, forward auth)
  ordered_cache_behavior {
    path_pattern           = "/api/*"
    target_origin_id       = "apigw-${aws_apigatewayv2_api.heritage_api.id}"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    compress               = true

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0

    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Content-Type"]
      cookies {
        forward = "none"
      }
    }
  }

  # SPA routing: serve index.html on 403/404 with 200
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  price_class = var.frontend_price_class

  viewer_certificate {
    cloudfront_default_certificate = var.acm_certificate_arn == null || var.acm_certificate_arn == ""
    acm_certificate_arn            = var.acm_certificate_arn
    ssl_support_method             = var.acm_certificate_arn != null && var.acm_certificate_arn != "" ? "sni-only" : null
    minimum_protocol_version       = var.acm_certificate_arn != null && var.acm_certificate_arn != "" ? "TLSv1.2_2021" : null
  }

  web_acl_id = var.enable_waf ? aws_wafv2_web_acl.cf[0].arn : null

  tags = merge(
    try(var.lambda_options["main"].tags, {}),
    {
      Service = "heritage-frontend"
      Stage   = local.environment_name
    }
  )
}

data "aws_caller_identity" "current" {}

resource "aws_s3_bucket_policy" "frontend_allow_cf" {
  count = var.enable_frontend ? 1 : 0
  bucket = aws_s3_bucket.frontend[0].id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid = "AllowCloudFrontServicePrincipalReadOnly"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action = [
          "s3:GetObject"
        ]
        Resource = [
          "${aws_s3_bucket.frontend[0].arn}/*"
        ]
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.frontend[0].arn
          }
        }
      }
    ]
  })
}

# Optional WAFv2 Web ACL (CloudFront scope) and association
resource "aws_wafv2_web_acl" "cf" {
  count       = var.enable_waf ? 1 : 0
  name        = "heritage-frontend-waf-${local.environment_name}"
  description = "WAF-for-Heritage-CloudFront-${local.environment_name}"
  scope       = "CLOUDFRONT"
  default_action {
    allow {}
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "heritage-frontend-waf-${local.environment_name}"
    sampled_requests_enabled   = true
  }

  dynamic "rule" {
    for_each = var.waf_enable_aws_managed_rules ? [1] : []
    content {
      name     = "AWSManagedRulesCommonRuleSet"
      priority = 10
      statement {
        managed_rule_group_statement {
          name        = "AWSManagedRulesCommonRuleSet"
          vendor_name = "AWS"
        }
      }
      override_action {
        none {}
      }
      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name                = "AWSManagedRulesCommonRuleSet"
        sampled_requests_enabled   = true
      }
    }
  }

  dynamic "rule" {
    for_each = var.waf_enable_aws_managed_rules ? [1] : []
    content {
      name     = "AWSManagedRulesKnownBadInputsRuleSet"
      priority = 20
      statement {
        managed_rule_group_statement {
          name        = "AWSManagedRulesKnownBadInputsRuleSet"
          vendor_name = "AWS"
        }
      }
      override_action {
        none {}
      }
      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name                = "AWSManagedRulesKnownBadInputsRuleSet"
        sampled_requests_enabled   = true
      }
    }
  }

  rule {
    name     = "RateLimitPerIp"
    priority = 100
    statement {
      rate_based_statement {
        aggregate_key_type = "IP"
        limit              = var.waf_rate_limit
      }
    }
    action {
      block {}
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitPerIp"
      sampled_requests_enabled   = true
    }
  }
}

# Optional Route53 alias for custom domain
resource "aws_route53_record" "frontend_alias" {
  count = var.enable_frontend && var.frontend_domain_name != null && var.frontend_domain_name != "" && var.route53_hosted_zone_id != null && var.route53_hosted_zone_id != "" ? 1 : 0

  zone_id = var.route53_hosted_zone_id
  name    = var.frontend_domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.frontend[0].domain_name
    zone_id                = aws_cloudfront_distribution.frontend[0].hosted_zone_id
    evaluate_target_health = false
  }
}

# Store important identifiers for CI to read
resource "aws_ssm_parameter" "frontend_bucket_name" {
  count = var.enable_frontend ? 1 : 0
  name  = "/heritage/${local.environment_name}/frontend/bucket_name"
  type  = "String"
  value = aws_s3_bucket.frontend[0].bucket
}

resource "aws_ssm_parameter" "frontend_distribution_id" {
  count = var.enable_frontend ? 1 : 0
  name  = "/heritage/${local.environment_name}/frontend/distribution_id"
  type  = "String"
  value = aws_cloudfront_distribution.frontend[0].id
}


