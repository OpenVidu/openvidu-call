import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

type EmbeddedTokenOptions = {
	/**
	 * The name of the participant.
	 *
	 * @example "participant123"
	 */
	participantName: string;
	/**
	 * The name of the room the participant will join.
	 *
	 * @example "myRoom"
	 */
	roomName: string;
	permissions?: EmbeddedParticipantPermissions | undefined;
};
type EmbeddedParticipantPermissions = Partial<{
	/**
	 * If true, the participant can record the session.
	 *
	 * @example true
	 */
	canRecord: boolean;
	/**
	 * If true, the participant can chat in the session.
	 *
	 * @example true
	 */
	canChat: boolean;
}>;

const EmbeddedParticipantPermissions: z.ZodType<EmbeddedParticipantPermissions> = z
	.object({ canRecord: z.boolean(), canChat: z.boolean() })
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
		description: `Returns a JWT token for authentication.`,
		requestFormat: 'json',
		parameters: [
			{
				name: 'body',
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
