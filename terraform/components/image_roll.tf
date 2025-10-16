#data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

data "aws_ecr_image" "target" {
	count           = var.enable_image_roll && var.external_image_digest == null ? 1 : 0
	repository_name = var.lambda_options["main"].repository_name
	image_tag       = var.lambda_options["main"].image_digest == null ? var.lambda_options["main"].image_tag : null
	image_digest    = var.lambda_options["main"].image_digest
}

locals {
	resolved_image_uri = coalesce(
		var.external_image_digest != null ? format(
			"%s.dkr.ecr.%s.amazonaws.com/%s@%s",
			data.aws_caller_identity.current.account_id,
			data.aws_region.current.id,
			var.lambda_options["main"].repository_name,
			var.external_image_digest
		) : null,
		( var.enable_image_roll ? try(one(data.aws_ecr_image.target[*].image_digest), null) : null ) != null ? format(
			"%s.dkr.ecr.%s.amazonaws.com/%s@%s",
			data.aws_caller_identity.current.account_id,
			data.aws_region.current.id,
			var.lambda_options["main"].repository_name,
			one(data.aws_ecr_image.target[*].image_digest)
		) : null
	)
}

resource "null_resource" "update_lambda_image" {
	count = var.enable_image_roll && local.resolved_image_uri != null ? 1 : 0

	triggers = {
		digest = local.resolved_image_uri
	}

	provisioner "local-exec" {
		interpreter = ["bash", "-c"]
		command     = "aws lambda update-function-code --region ${data.aws_region.current.id} --function-name ${module.lambda_service.function_name} --image-uri ${local.resolved_image_uri} --publish"
	}

	depends_on = [module.lambda_service]
}


