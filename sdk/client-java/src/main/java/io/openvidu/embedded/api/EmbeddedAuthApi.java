package io.openvidu.embedded.api;

import io.openvidu.embedded.invoker.ApiClient;

import io.openvidu.embedded.model.EmbeddedTokenOptions;
import io.openvidu.embedded.model.Error;
import io.openvidu.embedded.model.GenerateToken200Response;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.client.RestClient.ResponseSpec;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

@jakarta.annotation.Generated(value = "org.openapitools.codegen.languages.JavaClientCodegen", date = "2025-02-06T16:34:25.888068618+01:00[Europe/Madrid]", comments = "Generator version: 7.11.0")
public class EmbeddedAuthApi {
    private ApiClient apiClient;

    public EmbeddedAuthApi() {
        this(new ApiClient());
    }

    @Autowired
    public EmbeddedAuthApi(ApiClient apiClient) {
        this.apiClient = apiClient;
    }

    public ApiClient getApiClient() {
        return apiClient;
    }

    public void setApiClient(ApiClient apiClient) {
        this.apiClient = apiClient;
    }

    /**
     * Generate an embedded authentication token
     * 
     * <p><b>200</b> - Token successfully generated
     * <p><b>400</b> - Invalid credentials
     * <p><b>415</b> - Unsupported Media Type
     * <p><b>500</b> - Internal server error
     * @param embeddedTokenOptions Options for generating a token
     * @return GenerateToken200Response
     * @throws RestClientResponseException if an error occurs while attempting to invoke the API
     */
    private ResponseSpec generateTokenRequestCreation(EmbeddedTokenOptions embeddedTokenOptions) throws RestClientResponseException {
        Object postBody = embeddedTokenOptions;
        // create path and map variables
        final Map<String, Object> pathParams = new HashMap<>();

        final MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();
        final HttpHeaders headerParams = new HttpHeaders();
        final MultiValueMap<String, String> cookieParams = new LinkedMultiValueMap<>();
        final MultiValueMap<String, Object> formParams = new LinkedMultiValueMap<>();

        final String[] localVarAccepts = { 
            "application/json"
        };
        final List<MediaType> localVarAccept = apiClient.selectHeaderAccept(localVarAccepts);
        final String[] localVarContentTypes = { 
            "application/json"
        };
        final MediaType localVarContentType = apiClient.selectHeaderContentType(localVarContentTypes);

        String[] localVarAuthNames = new String[] {  };

        ParameterizedTypeReference<GenerateToken200Response> localVarReturnType = new ParameterizedTypeReference<>() {};
        return apiClient.invokeAPI("/token", HttpMethod.POST, pathParams, queryParams, postBody, headerParams, cookieParams, formParams, localVarAccept, localVarContentType, localVarAuthNames, localVarReturnType);
    }

    /**
     * Generate an embedded authentication token
     * 
     * <p><b>200</b> - Token successfully generated
     * <p><b>400</b> - Invalid credentials
     * <p><b>415</b> - Unsupported Media Type
     * <p><b>500</b> - Internal server error
     * @param embeddedTokenOptions Options for generating a token
     * @return GenerateToken200Response
     * @throws RestClientResponseException if an error occurs while attempting to invoke the API
     */
    public GenerateToken200Response generateToken(EmbeddedTokenOptions embeddedTokenOptions) throws RestClientResponseException {
        ParameterizedTypeReference<GenerateToken200Response> localVarReturnType = new ParameterizedTypeReference<>() {};
        return generateTokenRequestCreation(embeddedTokenOptions).body(localVarReturnType);
    }

    /**
     * Generate an embedded authentication token
     * 
     * <p><b>200</b> - Token successfully generated
     * <p><b>400</b> - Invalid credentials
     * <p><b>415</b> - Unsupported Media Type
     * <p><b>500</b> - Internal server error
     * @param embeddedTokenOptions Options for generating a token
     * @return ResponseEntity&lt;GenerateToken200Response&gt;
     * @throws RestClientResponseException if an error occurs while attempting to invoke the API
     */
    public ResponseEntity<GenerateToken200Response> generateTokenWithHttpInfo(EmbeddedTokenOptions embeddedTokenOptions) throws RestClientResponseException {
        ParameterizedTypeReference<GenerateToken200Response> localVarReturnType = new ParameterizedTypeReference<>() {};
        return generateTokenRequestCreation(embeddedTokenOptions).toEntity(localVarReturnType);
    }

    /**
     * Generate an embedded authentication token
     * 
     * <p><b>200</b> - Token successfully generated
     * <p><b>400</b> - Invalid credentials
     * <p><b>415</b> - Unsupported Media Type
     * <p><b>500</b> - Internal server error
     * @param embeddedTokenOptions Options for generating a token
     * @return ResponseSpec
     * @throws RestClientResponseException if an error occurs while attempting to invoke the API
     */
    public ResponseSpec generateTokenWithResponseSpec(EmbeddedTokenOptions embeddedTokenOptions) throws RestClientResponseException {
        return generateTokenRequestCreation(embeddedTokenOptions);
    }
}
