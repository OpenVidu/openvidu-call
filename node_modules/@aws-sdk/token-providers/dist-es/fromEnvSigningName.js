import { getBearerTokenEnvKey } from "@aws-sdk/core";
import { TokenProviderError } from "@smithy/property-provider";
export const fromEnvSigningName = ({ logger, signingName } = {}) => async () => {
    logger?.debug?.("@aws-sdk/token-providers - fromEnvSigningName");
    if (!signingName) {
        throw new TokenProviderError("Please pass 'signingName' to compute environment variable key", { logger });
    }
    const bearerTokenKey = getBearerTokenEnvKey(signingName);
    if (!(bearerTokenKey in process.env)) {
        throw new TokenProviderError(`Token not present in '${bearerTokenKey}' environment variable`, { logger });
    }
    return { token: process.env[bearerTokenKey] };
};
