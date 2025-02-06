# EmbeddedAuthApi

All URIs are relative to *http://localhost:6080/v1/embedded/api*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**generateToken**](EmbeddedAuthApi.md#generateToken) | **POST** /token | Generate an embedded authentication token |



## generateToken

> GenerateToken200Response generateToken(embeddedTokenOptions)

Generate an embedded authentication token

### Example

```java
// Import classes:
import io.openvidu.embedded.invoker.ApiClient;
import io.openvidu.embedded.invoker.ApiException;
import io.openvidu.embedded.invoker.Configuration;
import io.openvidu.embedded.invoker.models.*;
import io.openvidu.embedded.api.EmbeddedAuthApi;

public class Example {
    public static void main(String[] args) {
        ApiClient defaultClient = Configuration.getDefaultApiClient();
        defaultClient.setBasePath("http://localhost:6080/v1/embedded/api");

        EmbeddedAuthApi apiInstance = new EmbeddedAuthApi(defaultClient);
        EmbeddedTokenOptions embeddedTokenOptions = new EmbeddedTokenOptions(); // EmbeddedTokenOptions | Options for generating a token
        try {
            GenerateToken200Response result = apiInstance.generateToken(embeddedTokenOptions);
            System.out.println(result);
        } catch (ApiException e) {
            System.err.println("Exception when calling EmbeddedAuthApi#generateToken");
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
| **embeddedTokenOptions** | [**EmbeddedTokenOptions**](EmbeddedTokenOptions.md)| Options for generating a token | [optional] |

### Return type

[**GenerateToken200Response**](GenerateToken200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Token successfully generated |  -  |
| **400** | Invalid credentials |  -  |
| **415** | Unsupported Media Type |  -  |
| **500** | Internal server error |  -  |

