# OpenViduEmbeddedClient

All URIs are relative to *http://localhost:6080/embedded/api/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**addParticipant**](OpenViduEmbeddedClient.md#addParticipant) | **POST** /participant | Generate a participant URL for an embedded room |



## addParticipant

> AddParticipant200Response addParticipant(embeddedTokenOptions)

Generate a participant URL for an embedded room

Generates a secure URL that allows a participant to join an embedded room.

### Example

```java
// Import classes:
import io.openvidu.embedded.client.ApiClient;
import io.openvidu.embedded.client.ApiException;
import io.openvidu.embedded.client.Configuration;
import io.openvidu.embedded.client.models.*;
import io.openvidu.embedded.api.OpenViduEmbeddedClient;

public class Example {
    public static void main(String[] args) {
        ApiClient defaultClient = Configuration.getDefaultApiClient();
        defaultClient.setBasePath("http://localhost:6080/embedded/api/v1");

        OpenViduEmbeddedClient apiInstance = new OpenViduEmbeddedClient(defaultClient);
        EmbeddedTokenOptions embeddedTokenOptions = new EmbeddedTokenOptions(); // EmbeddedTokenOptions | 
        try {
            AddParticipant200Response result = apiInstance.addParticipant(embeddedTokenOptions);
            System.out.println(result);
        } catch (ApiException e) {
            System.err.println("Exception when calling OpenViduEmbeddedClient#addParticipant");
            System.err.println("Status code: " + e.getCode());
            System.err.println("Reason: " + e.getResponseBody());
            System.err.println("Response headers: " + e.getResponseHeaders());
            e.printStackTrace();
        }
    }
}
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **embeddedTokenOptions** | [**EmbeddedTokenOptions**](EmbeddedTokenOptions.md)|  | |

### Return type

[**AddParticipant200Response**](AddParticipant200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successfully generated the embedded URL for the participant |  -  |
| **400** | Bad Request — Invalid or missing input parameters |  -  |
| **415** | Unsupported Media Type |  -  |
| **500** | Internal server error |  -  |

