import {
	_Object,
	DeleteObjectCommandOutput,
	HeadObjectCommandOutput,
	ListObjectsV2CommandOutput,
	PutObjectCommandOutput
} from '@aws-sdk/client-s3';

import { AzureBlobService } from './azure-blob.service.js';
import { IStorageService } from './IStorage.service.js';
import { LoggerService } from './logger.service.js';
import { Readable } from 'stream';

export class AzureBlobWrapper implements IStorageService {
	protected static instance: AzureBlobWrapper;
	private logger = LoggerService.getInstance();

	private constructor() {
		// Private constructor to enforce singleton pattern
		if (AzureBlobWrapper.instance) {
			throw new Error('Use AzureBlobWrapper.getInstance() to get the instance.');
		}
	}

	static getInstance() {
		if (!AzureBlobWrapper.instance) {
			AzureBlobWrapper.instance = new AzureBlobWrapper();
		}

		return AzureBlobWrapper.instance;
	}

	/** Upload JSON as blob */
	async uploadObject(name: string, body: any, bucket: string): Promise<PutObjectCommandOutput> {
		try {
			const uploadBlobResponse = await AzureBlobService.getInstance().uploadObject(name, body);
			return {
				$metadata: {
					httpStatusCode: uploadBlobResponse._response?.status || 200,
					requestId: uploadBlobResponse.requestId
				},
				ETag: uploadBlobResponse.etag
			} as PutObjectCommandOutput;
		} catch (err: any) {
			throw new Error(`Error uploading blob: ${err.message}`);
		}
	}

	async deleteObject(name: string, bucket: string): Promise<DeleteObjectCommandOutput> {
		try {
			const metadata = await AzureBlobService.getInstance().deleteObject(name);
			return { $metadata: { httpStatusCode: 204 } } as DeleteObjectCommandOutput;
		} catch (err: any) {
			throw new Error(`Error deleting blob: ${err.message}`);
		}
	}

	async listObjects(
		directory: string,
		searchPattern: string,
		bucket: string,
		maxObjects: number
	): Promise<ListObjectsV2CommandOutput> {
		try {
			const blobs = await AzureBlobService.getInstance().listObjects(directory, searchPattern);
			const contents = blobs.map((blob) => ({
				Key: blob.name,
				LastModified: blob.properties.lastModified,
				Size: blob.properties.contentLength,
				ETag: blob.properties.etag,
				StorageClass: 'STANDARD'
			})) as _Object[];
			return {
				Contents: contents,
				IsTruncated: false,
				NextContinuationToken: undefined,
				MaxKeys: contents.length,
				KeyCount: contents.length,
				$metadata: { httpStatusCode: 200 }
			} as ListObjectsV2CommandOutput;
		} catch (err: any) {
			throw new Error(`Error listing blobs: ${err.message}`);
		}
	}

	async getObjectAsJson(name: string, bucket: string): Promise<Object | undefined> {
		try {
			return AzureBlobService.getInstance().getObjectAsJson(name);
		} catch (err: any) {
			throw new Error(`Error getting blob as JSON: ${err.message}`);
		}
	}

	async getObjectAsStream(name: string, bucket: string, range?: { start: number; end: number }): Promise<Readable> {
		try {
			return AzureBlobService.getInstance().getObjectAsStream(name, range);
		} catch (err: any) {
			throw new Error(`Error getting blob as stream: ${err.message}`);
		}
	}

	async getHeaderObject(name: string, bucket: string): Promise<HeadObjectCommandOutput> {
		try {
			const data = await AzureBlobService.getInstance().getHeaderObject(name);
			return {
				ContentType: data.contentType,
				ContentLength: data.contentLength,
				LastModified: data.lastModified,
				ETag: data.etag,
				Metadata: data.metadata
			} as HeadObjectCommandOutput;
		} catch (err: any) {
			throw new Error(`Error getting header for blob: ${err.message}`);
		}
	}
}
