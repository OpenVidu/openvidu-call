import { z } from 'zod';
import { schemas } from './client/embedded-api';

export { createApiClient as EmbeddedApiClient } from './client/embedded-api';
// --- BEGIN TYPES EXPORTS ---
export type EmbeddedParticipantPermissions = z.infer<typeof schemas.EmbeddedParticipantPermissions>;
export type EmbeddedTokenOptions = z.infer<typeof schemas.EmbeddedTokenOptions>;
export type Error = z.infer<typeof schemas.Error>;
