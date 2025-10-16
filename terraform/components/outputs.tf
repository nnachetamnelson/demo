output "frontend_bucket_name" {
  description = "S3 bucket name for the frontend"
  value       = try(aws_s3_bucket.frontend[0].bucket, null)
}

output "frontend_distribution_id" {
  description = "CloudFront distribution ID for the frontend"
  value       = try(aws_cloudfront_distribution.frontend[0].id, null)
}

output "frontend_distribution_domain" {
  description = "CloudFront domain name for the frontend"
  value       = try(aws_cloudfront_distribution.frontend[0].domain_name, null)
}


