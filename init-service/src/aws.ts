import { S3 } from 'aws-sdk';
import fs from 'fs';
import path from 'path';

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.S3_ENDPOINT,
});

export async function copyS3Folder(
  sourcePrefix: string,
  destinationPrefix: string,
  continuationToken?: string
): Promise<void> {
  try {
    // list all objects in the source folder
    // prefix = folder
    const listParams = {
      Bucket: process.env.S3_BUCKET ?? '',
      Prefix: sourcePrefix,
      ContinuationToken: continuationToken,
    };

    const listedObjects = await s3.listObjectsV2(listParams).promise();

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) return;

    // copy each object to the new location, key = path
    await Promise.all(
      listedObjects.Contents.map(async (object) => {
        if (!object.Key) return;

        let destinationKey = object.Key.replace(
          sourcePrefix,
          destinationPrefix
        );
        let copyParams = {
          Bucket: process.env.S3_BUCKET ?? '',
          CopySource: `${process.env.S3_BUCKET}/${object.Key}`,
          Key: destinationKey,
        };

        console.log(copyParams);

        await s3.copyObject(copyParams).promise();
        console.log(`Copied ${object.Key} to ${destinationKey}`);
      })
    );

    // check if list was truncated and continue copying if necessary
    if (listedObjects.IsTruncated) {
      listParams.ContinuationToken = listedObjects.NextContinuationToken;
      await copyS3Folder(sourcePrefix, destinationPrefix, continuationToken);
    }
  } catch (error) {
    console.error('Error copying folder: ', error);
  }
}

// key = base path, filepath = path for a specific file
export const saveToS3 = async (
  key: string,
  filePath: string,
  content: string
): Promise<void> => {
  const params = {
    Bucket: process.env.S3_BUCKET ?? '',
    Key: `${key}${filePath}`,
    Body: content,
  };

  await s3.putObject(params).promise();
};
