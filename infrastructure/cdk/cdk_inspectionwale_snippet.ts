
// CDK snippet (TypeScript) for core resources
import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class InspectionWaleStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'InspectionDataBucket', {
      bucketName: `inspectionwale-data-${this.account}`,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const table = new dynamodb.Table(this, 'InspectionsTable', {
      tableName: 'Inspections',
      partitionKey: { name: 'inspectionId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    table.addGlobalSecondaryIndex({
      indexName: 'CustomerCreatedAtIndex',
      partitionKey: { name: 'customerId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    const pdfLambdaRole = new iam.Role(this, 'PdfLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    pdfLambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: ['s3:PutObject','s3:GetObject'],
      resources: [bucket.arnForObjects('*')],
    }));

    pdfLambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: ['dynamodb:GetItem','dynamodb:PutItem','dynamodb:UpdateItem','dynamodb:Query'],
      resources: [table.tableArn],
    }));

    const pdfGen = new lambda.DockerImageFunction(this, 'PdfGenerator', {
      code: lambda.DockerImageCode.fromImageAsset('path/to/pdf-generator'), // define Dockerfile
      role: pdfLambdaRole,
      timeout: cdk.Duration.minutes(2),
      memorySize: 2048,
    });
  }
}
