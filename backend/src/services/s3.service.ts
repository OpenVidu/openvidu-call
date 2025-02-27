import {
	_Object,
	DeleteObjectCommand,
	DeleteObjectCommandOutput,
	GetObjectCommand,
	GetObjectCommandOutput,
	HeadObjectCommand,
	HeadObjectCommandOutput,
	ListObjectsV2Command,
	ListObjectsV2CommandOutput,
	PutObjectCommand,
	PutObjectCommandOutput,
	S3Client,
	S3ClientConfig
} from '@aws-sdk/client-s3';

import {
	MEET_S3_ACCESS_KEY,
	MEET_AWS_REGION,
	MEET_S3_BUCKET,
	MEET_S3_SERVICE_ENDPOINT,
	MEET_S3_SECRET_KEY,
	MEET_S3_WITH_PATH_STYLE_ACCESS
} from '../environment.js';
import { errorS3NotAvailable, internalError } from '../models/error.model.js';
import { Readable } from 'stream';
import { LoggerService } from './logger.service.js';
import { inject, injectable } from '../config/dependency-injector.config.js';

@injectable()
export class S3Service {
	protected s3: S3Client;

	constructor(@inject(LoggerService) protected logger: LoggerService) {
		console.log('CE S3Service constructor');
		const config: S3ClientConfig = {
			region: MEET_AWS_REGION,
			credentials: {
				accessKeyId: MEET_S3_ACCESS_KEY,
				secretAccessKey: MEET_S3_SECRET_KEY
			},
			endpoint: MEET_S3_SERVICE_ENDPOINT,
			forcePathStyle: MEET_S3_WITH_PATH_STYLE_ACCESS === 'true'
		};

		this.s3 = new S3Client(config);
	}

	/**
	 * Checks if a file exists in the specified S3 bucket.
	 *
	 * @param path - The path of the file to check.
	 * @param MEET_AWS_S3_BUCKET - The name of the S3 bucket.
	 * @returns A boolean indicating whether the file exists or not.
	 */
	async exists(path: string, bucket: string = MEET_S3_BUCKET) {
		try {
			await this.getHeaderObject(path, bucket);
			return true;
		} catch (error) {
			return false;
		}
	}

	// copyObject(
	// 	path: string,
	// 	newFileName: string,
	// 	bucket: string = MEET_AWS_S3_BUCKET
	// ): Promise<CopyObjectCommandOutput> {
	// 	const newKey = path.replace(path.substring(path.lastIndexOf('/') + 1), newFileName);

	// 	const command = new CopyObjectCommand({
	// 		Bucket: bucket,
	// 		CopySource: `${MEET_AWS_S3_BUCKET}/${path}`,
	// 		Key: newKey
	// 	});

	// 	return this.run(command);
	// }

	async saveObject(name: string, body: any, bucket: string = MEET_S3_BUCKET): Promise<PutObjectCommandOutput> {
		try {
			const command = new PutObjectCommand({
				Bucket: bucket,
				Key: name,
				Body: JSON.stringify(body)
			});
			return await this.run(command);
		} catch (error: any) {
			this.logger.error(`Error putting object in S3: ${error}`);

			if (error.code === 'ECONNREFUSED') {
				throw errorS3NotAvailable(error);
			}

			throw internalError(error);
		}
	}

	/**
	 * Deletes an object from an S3 bucket.
	 *
	 * @param name - The name of the object to delete.
	 * @param bucket - The name of the S3 bucket (optional, defaults to MEET_S3_BUCKET).
	 * @returns A promise that resolves to the result of the delete operation.
	 * @throws Throws an error if there was an error deleting the object.
	 */
	async deleteObject(name: string, bucket: string = MEET_S3_BUCKET): Promise<DeleteObjectCommandOutput> {
		try {
			this.logger.verbose(`Deleting object in S3: ${name}`);
			const command = new DeleteObjectCommand({ Bucket: bucket, Key: name });
			return await this.run(command);
		} catch (error) {
			this.logger.error(`Error deleting object in S3: ${error}`);
			throw internalError(error);
		}
	}

	/**
	 * Lists all objects in an S3 bucket with optional subbucket and search pattern filtering.
	 *
	 * @param {string} [subbucket=''] - The subbucket within the main bucket to list objects from.
	 * @param {string} [searchPattern=''] - A regex pattern to filter the objects by their keys.
	 * @param {string} [bucket=MEET_S3_BUCKET] - The name of the S3 bucket. Defaults to MEET_S3_BUCKET.
	 * @param {number} [maxObjects=1000] - The maximum number of objects to retrieve in one request. Defaults to 1000.
	 * @returns {Promise<ListObjectsV2CommandOutput>} - A promise that resolves to the output of the ListObjectsV2Command.
	 * @throws {Error} - Throws an error if there is an issue listing the objects.
	 */
	async listObjects(
		subbucket = '',
		searchPattern = '',
		bucket: string = MEET_S3_BUCKET,
		maxObjects = 1000
	): Promise<ListObjectsV2CommandOutput> {
		const prefix = subbucket ? `${subbucket}/` : '';
		let allContents: _Object[] = [];
		let continuationToken: string | undefined = undefined;
		let isTruncated = true;
		let fullResponse: ListObjectsV2CommandOutput | undefined = undefined;

		try {
			while (isTruncated) {
				const command = new ListObjectsV2Command({
					Bucket: bucket,
					Prefix: prefix,
					MaxKeys: maxObjects,
					ContinuationToken: continuationToken
				});

				const response: ListObjectsV2CommandOutput = await this.run(command);

				if (!fullResponse) {
					fullResponse = response;
				}

				// Filter the objects by the search pattern if it is provided
				let objects = response.Contents || [];

				if (searchPattern) {
					const regex = new RegExp(searchPattern);
					objects = objects.filter((object) => object.Key && regex.test(object.Key));
				}

				// Add the objects to the list of all objects
				allContents = allContents.concat(objects);

				// Update the loop control variables
				isTruncated = response.IsTruncated ?? false;
				continuationToken = response.NextContinuationToken;
			}

			if (fullResponse) {
				fullResponse.Contents = allContents;
				fullResponse.IsTruncated = false;
				fullResponse.NextContinuationToken = undefined;
				fullResponse.MaxKeys = allContents.length;
				fullResponse.KeyCount = allContents.length;
			}

			return fullResponse!;
		} catch (error) {
			this.logger.error(`Error listing objects: ${error}`);

			if ((error as any).code === 'ECONNREFUSED') {
				throw errorS3NotAvailable(error);
			}

			throw internalError(error);
		}
	}

	async getObjectAsJson(name: string, bucket: string = MEET_S3_BUCKET): Promise<Object | undefined> {
		try {
			const obj = await this.getObject(name, bucket);
			const str = await obj.Body?.transformToString();
			return JSON.parse(str as string);
		} catch (error: any) {
			if (error.name === 'NoSuchKey') {
				this.logger.warn(`Object '${name}' does not exist in S3`);
				return undefined;
			}

			if (error.code === 'ECONNREFUSED') {
				throw errorS3NotAvailable(error);
			}

			this.logger.error(`Error getting object from S3. Maybe it has been deleted: ${error}`);
			throw internalError(error);
		}
	}

	async getObjectAsStream(name: string, bucket: string = MEET_S3_BUCKET, range?: { start: number; end: number }) {
		try {
			const obj = await this.getObject(name, bucket, range);

			if (obj.Body) {
				return obj.Body as Readable;
			} else {
				throw new Error('Empty body response');
			}
		} catch (error: any) {
			this.logger.error(`Error getting object from S3: ${error}`);

			if (error.code === 'ECONNREFUSED') {
				throw errorS3NotAvailable(error);
			}

			throw internalError(error);
		}
	}

	async getHeaderObject(name: string, bucket: string = MEET_S3_BUCKET): Promise<HeadObjectCommandOutput> {
		try {
			const headParams: HeadObjectCommand = new HeadObjectCommand({
				Bucket: bucket,
				Key: name
			});
			return await this.run(headParams);
		} catch (error) {
			this.logger.error(`Error getting header object from S3 in ${name}: ${error}`);
			throw internalError(error);
		}
	}

	quit() {
		this.s3.destroy();
	}

	private async getObject(
		name: string,
		bucket: string = MEET_S3_BUCKET,
		range?: { start: number; end: number }
	): Promise<GetObjectCommandOutput> {
		const command = new GetObjectCommand({
			Bucket: bucket,
			Key: name,
			Range: range ? `bytes=${range.start}-${range.end}` : undefined
		});

		return await this.run(command);
	}

	protected async run(command: any) {
		return this.s3.send(command);
	}
}
