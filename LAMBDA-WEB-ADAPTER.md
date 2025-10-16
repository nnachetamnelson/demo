# AWS Lambda Web Adapter Integration

## What Changed?

Your Express app now uses **AWS Lambda Web Adapter** instead of serverless-express. This means:

✅ **No code changes needed** - Your Express app runs as-is
✅ **Better performance** - Direct HTTP handling
✅ **Simpler architecture** - Adapter handles Lambda integration
✅ **Standard Express patterns** - No Lambda-specific code

## How It Works

```
Lambda Invoke Event
        ↓
  Lambda Web Adapter (Extension Layer)
        ↓
    Converts to HTTP
        ↓
   Your Express App (Port 8080)
        ↓
    HTTP Response
        ↓
  Lambda Web Adapter
        ↓
   Lambda Response
```

## Configuration

### Environment Variables (set in Dockerfile.lambda):

```bash
PORT=8080                                    # Express listens here
AWS_LWA_READINESS_CHECK_PATH=/health        # Health check endpoint
AWS_LWA_READINESS_CHECK_TIMEOUT=30000       # 30s for DB connections
AWS_LWA_ENABLE_COMPRESSION=true             # Gzip responses
```

### Health Check Endpoint

Added to `server.js`:
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'education-backend' 
  });
});
```

This tells Lambda when your app is ready to receive traffic (after DB connects).

## Key Benefits

### 1. **No Lambda Handler Needed**
- ❌ Before: Needed `lambda-handler.js` + `serverless-express`
- ✅ Now: Just run `node server.js` normally

### 2. **Cold Start Optimization**
- Adapter waits for your app to be healthy before accepting requests
- Database connections established before first request
- 30-second timeout for initialization

### 3. **Standard Development**
- Same code runs locally AND in Lambda
- No special Lambda testing needed
- Debug with `docker run` locally

### 4. **Built-in Features**
- ✅ Automatic gzip compression
- ✅ HTTP/2 support
- ✅ WebSocket support (if needed)
- ✅ Streaming responses

## Testing Locally

### Test with Docker:
```bash
# Build the Lambda image
docker build -f Dockerfile.lambda -t education-backend-lambda .

# Run locally (simulates Lambda environment)
docker run -p 8080:8080 \
  -e DB_HOST=host.docker.internal \
  -e DB_NAME=education \
  -e DB_USER=postgres \
  -e DB_PASSWORD=secret \
  -e JWT_SECRET=your-secret \
  education-backend-lambda

# Test health check
curl http://localhost:8080/health

# Test API
curl http://localhost:8080/api/auth
```

## Deployment Differences

### With Lambda Web Adapter:
```yaml
# CloudFormation Lambda Function
Environment:
  Variables:
    PORT: 8080  # Adapter expects this
    # Your app env vars...
    DB_HOST: !GetAtt DBInstance.Endpoint.Address
    JWT_SECRET: !Ref JWTSecret
```

### Lambda Function Configuration:
- **Memory**: 512 MB (recommended)
- **Timeout**: 30 seconds (for cold starts)
- **Package Type**: Image (Docker)
- **Architecture**: x86_64

## Monitoring

### CloudWatch Logs:
```bash
# View adapter logs
aws logs tail /aws/lambda/education-platform-backend --follow

# Adapter logs show:
# - HTTP request/response details
# - Readiness check status
# - Performance metrics
```

### Key Metrics to Watch:
- **Init Duration**: Should be < 30s (DB connection time)
- **Cold Start**: First request may take 5-10s
- **Warm Requests**: Should be < 500ms

## Troubleshooting

### 1. "Readiness check timeout"
**Cause**: App didn't return 200 on `/health` within 30s

**Solution**: 
- Check database connectivity
- Increase `AWS_LWA_READINESS_CHECK_TIMEOUT`
- Add logging to startup sequence

### 2. "Connection refused"
**Cause**: App not listening on PORT 8080

**Solution**: Verify `server.js` uses `process.env.PORT` or defaults to 8080

### 3. "502 Bad Gateway"
**Cause**: App crashed after startup

**Solution**: Check CloudWatch logs for errors

## Comparison

### serverless-express (Old):
```javascript
// lambda-handler.js
const serverlessExpress = require('@vendia/serverless-express');
const app = require('./app');
exports.handler = serverlessExpress({ app });
```

### Lambda Web Adapter (New):
```dockerfile
# Just copy the adapter
COPY --from=aws_lwa /lambda-adapter /opt/extensions/lambda-adapter

# Run your app normally
CMD ["node", "server.js"]
```

**Result**: Simpler, faster, more maintainable! 🚀

## Resources

- [AWS Lambda Web Adapter Docs](https://github.com/awslabs/aws-lambda-web-adapter)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Lambda Extensions](https://docs.aws.amazon.com/lambda/latest/dg/lambda-extensions.html)

---

**Your Express app now runs in Lambda exactly as it does locally!** ✨
