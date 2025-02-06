import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

type EmbeddedTokenOptions = {
	/**
	 * The name of the participant.
	 *
	 * @example "OpenVidu"
	 */
	participantName: string;
	/**
	 * The name of the room the participant will join.
	 *
	 * @example "OpenViduEmbedded"
	 */
	roomName: string;
	permissions?: EmbeddedParticipantPermissions | undefined;
};
type EmbeddedParticipantPermissions = Partial<{
	/**
	 * If true, the participant can record the session.
	 *
	 * @example true
	 * @default true
	 */
	canRecord: boolean;
	/**
	 * If true, the participant can chat in the session.
	 *
	 * @example true
	 * @default true
	 */
	canChat: boolean;
}>;

const EmbeddedParticipantPermissions: z.ZodType<EmbeddedParticipantPermissions> = z
	.object({ canRecord: z.boolean().default(true), canChat: z.boolean().default(true) })
	.partial()
	.strict()
	.passthrough();
const EmbeddedTokenOptions: z.ZodType<EmbeddedTokenOptions> = z
	.object({
		participantName: z.string(),
		roomName: z.string(),
		permissions: EmbeddedParticipantPermissions.optional()
	})
	.strict()
	.passthrough();
const Error = z.object({ code: z.number().int(), message: z.string() }).strict().passthrough();

export const schemas = {
	EmbeddedParticipantPermissions,
	EmbeddedTokenOptions,
	Error
};

const endpoints = makeApi([
	{
		method: 'post',
		path: '/embedded/api/token',
		alias: 'generateToken',
		requestFormat: 'json',
		parameters: [
			{
				name: 'body',
				description: `Options for generating a token`,
				type: 'Body',
				schema: EmbeddedTokenOptions
			}
		],
		response: z.object({ token: z.string() }).partial().strict().passthrough(),
		errors: [
			{
				status: 400,
				description: `Invalid credentials`,
				schema: Error
			},
			{
				status: 415,
				description: `Unsupported Media Type`,
				schema: Error
			},
			{
				status: 500,
				description: `Internal server error`,
				schema: Error
			}
		]
	}
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
	return new Zodios(baseUrl, endpoints, options);
}
