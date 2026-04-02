#!/bin/bash
# Deploy 7C NOTAM Prototype to a new EC2 instance via CloudFormation
set -euo pipefail

STACK_NAME="${STACK_NAME:-notam-prototype}"
REGION="${AWS_REGION:-us-east-1}"
S3_KEY="notam-prototype.tar.gz"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Existing VPC/Subnet to reuse (avoids VPC limit issues)
VPC_ID="${VPC_ID:-vpc-07fd5dc8a60003733}"
SUBNET_ID="${SUBNET_ID:-subnet-0ece2621bcfb2cf1b}"

# Derive deploy bucket name from AWS account ID
if [ -z "${DEPLOY_S3_BUCKET:-}" ]; then
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    S3_BUCKET="notam-prototype-deploy-${AWS_ACCOUNT_ID}"
else
    S3_BUCKET="$DEPLOY_S3_BUCKET"
fi

echo "============================================"
echo " 7C NOTAM Prototype - Deploy"
echo "============================================"

# 1) Package the application
echo ""
echo "[1/4] Packaging notam-prototype..."
cd "$PROJECT_DIR"
tar -czf /tmp/notam-prototype.tar.gz \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='.pipeline' \
    --exclude='infra' \
    --exclude='e2e' \
    --exclude='test-results' \
    --exclude='playwright-report' \
    --exclude='.env.local' \
    .
echo "   Package created: /tmp/notam-prototype.tar.gz ($(du -h /tmp/notam-prototype.tar.gz | cut -f1))"

# 2) Create S3 bucket (ignore error if already exists)
echo ""
echo "[2/4] Ensuring S3 bucket exists: ${S3_BUCKET}"
if [ "$REGION" = "us-east-1" ]; then
    aws s3api create-bucket --bucket "$S3_BUCKET" --region "$REGION" 2>/dev/null || true
else
    aws s3api create-bucket --bucket "$S3_BUCKET" --region "$REGION" \
        --create-bucket-configuration LocationConstraint="$REGION" 2>/dev/null || true
fi

# 3) Upload package to S3
echo ""
echo "[3/4] Uploading package to s3://${S3_BUCKET}/${S3_KEY}..."
aws s3 cp /tmp/notam-prototype.tar.gz "s3://${S3_BUCKET}/${S3_KEY}"
rm -f /tmp/notam-prototype.tar.gz
echo "   Upload complete."

# 4) Deploy CloudFormation stack
echo ""
echo "[4/4] Deploying CloudFormation stack: ${STACK_NAME}..."
aws cloudformation deploy \
    --stack-name "$STACK_NAME" \
    --template-file "$SCRIPT_DIR/cloudformation.yaml" \
    --capabilities CAPABILITY_NAMED_IAM \
    --region "$REGION" \
    --parameter-overrides \
        S3CodeBucket="$S3_BUCKET" \
        S3CodeKey="$S3_KEY" \
        AwsRegion="$REGION" \
        VpcId="$VPC_ID" \
        SubnetId="$SUBNET_ID"

echo ""
echo "============================================"
echo " Deployment Complete!"
echo "============================================"

# Print outputs
CF_URL=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontURL`].OutputValue' \
    --output text)

INSTANCE_ID=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`InstanceId`].OutputValue' \
    --output text)

echo ""
echo " CloudFront URL : ${CF_URL}"
echo " EC2 Instance ID: ${INSTANCE_ID}"
echo ""
echo " Test: curl ${CF_URL}"
echo ""
echo " To delete: aws cloudformation delete-stack --stack-name ${STACK_NAME} --region ${REGION}"
