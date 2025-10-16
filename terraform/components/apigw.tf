resource "aws_apigatewayv2_api" "heritage_api" {
    name                           = "heritage-http"
    protocol_type                  = "HTTP"
    disable_execute_api_endpoint   = var.disable_execute_api_endpoint

    cors_configuration {
      allow_origins = ["*"]
      allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
      allow_headers = ["Authorization", "Content-Type"]
    }
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
	api_id                 = aws_apigatewayv2_api.heritage_api.id
	integration_type       = "AWS_PROXY"
	integration_uri        = module.lambda_service.invoke_arn
	payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "default" {
	api_id    = aws_apigatewayv2_api.heritage_api.id
    route_key = "$default"
    target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
    authorization_type = var.enable_jwt_authorizer ? "JWT" : "NONE"
    authorizer_id      = var.enable_jwt_authorizer ? aws_apigatewayv2_authorizer.jwt[0].id : null
}

resource "aws_apigatewayv2_stage" "default" {
	api_id      = aws_apigatewayv2_api.heritage_api.id
	name        = "$default"
	auto_deploy = true

	access_log_settings {
		destination_arn = aws_cloudwatch_log_group.apigw_access.arn
		format = jsonencode({
			requestId                 = "$context.requestId"
			routeKey                  = "$context.routeKey"
			protocol                  = "$context.protocol"
			status                    = "$context.status"
			responseLength            = "$context.responseLength"
			integrationStatus         = "$context.integrationStatus"
			integrationErrorMessage   = "$context.integrationErrorMessage"
			errorMessage              = "$context.error.message"
			errorResponseType         = "$context.error.responseType"
			integrationLatency        = "$context.integrationLatency"
			ip                        = "$context.identity.sourceIp"
			userAgent                 = "$context.identity.userAgent"
			requestTime               = "$context.requestTime"
			httpMethod                = "$context.httpMethod"
			path                      = "$context.path"
			stage                     = "$context.stage"
			domainName                = "$context.domainName"
		})
	}
}

resource "aws_apigatewayv2_authorizer" "jwt" {
  count = var.enable_jwt_authorizer ? 1 : 0

  api_id           = aws_apigatewayv2_api.heritage_api.id
  name             = "jwt-authorizer"
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]

  jwt_configuration {
    audience = var.jwt_audiences
    issuer   = var.jwt_issuer
  }
}

## Note: HTTP API (v2) resource policy is not supported in this provider version.
## Lock down is achieved via disable_execute_api_endpoint + CloudFront + WAF.

# Custom domain for API (so we can front with CloudFront + WAF)
resource "aws_apigatewayv2_domain_name" "api" {
  count = var.api_domain_name != null && var.api_domain_name != "" && var.api_acm_certificate_arn != null && var.api_acm_certificate_arn != "" ? 1 : 0

  domain_name = var.api_domain_name

  domain_name_configuration {
    certificate_arn = var.api_acm_certificate_arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}

resource "aws_apigatewayv2_api_mapping" "api" {
  count = length(aws_apigatewayv2_domain_name.api) > 0 ? 1 : 0

  api_id      = aws_apigatewayv2_api.heritage_api.id
  domain_name = aws_apigatewayv2_domain_name.api[0].id
  stage       = aws_apigatewayv2_stage.default.name
}

resource "aws_route53_record" "api_alias" {
  count = var.api_route53_hosted_zone_id != null && var.api_route53_hosted_zone_id != "" && length(aws_apigatewayv2_domain_name.api) > 0 ? 1 : 0

  zone_id = var.api_route53_hosted_zone_id
  name    = var.api_domain_name
  type    = "A"

  alias {
    name                   = aws_apigatewayv2_domain_name.api[0].domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.api[0].domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_lambda_permission" "allow_apigw" {
	statement_id  = "AllowAPIGatewayInvoke"
	action        = "lambda:InvokeFunction"
	function_name = module.lambda_service.function_name
	principal     = "apigateway.amazonaws.com"
	source_arn    = "${aws_apigatewayv2_api.heritage_api.execution_arn}/*/*"
}

output "api_base_url" {
	description = "HTTP API base URL"
	value       = aws_apigatewayv2_api.heritage_api.api_endpoint
}

# CloudWatch Logs group for API Gateway access logs
resource "aws_cloudwatch_log_group" "apigw_access" {
	name              = "/aws/apigateway/heritage-http-access-${var.lambda_options["main"].environment_name}"
	retention_in_days = 14
}


