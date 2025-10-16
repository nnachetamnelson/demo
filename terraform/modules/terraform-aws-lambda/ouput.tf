output "function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.this.arn
}

output "function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.this.function_name
}

output "invoke_arn" {
  description = "Invoke ARN of the Lambda function"
  value       = aws_lambda_function.this.invoke_arn
}

output "version" {
  description = "Latest published version"
  value       = aws_lambda_function.this.version
}

output "log_group_name" {
  description = "CloudWatch Log Group name"
  value       = local.log_group_name
}



