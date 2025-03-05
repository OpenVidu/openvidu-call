package io.openvidu.meet.webhooks;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Controller {

    private static final String API_KEY = "meet-api-key";
    private static final long MAX_ELAPSED_TIME = 5 * 60 * 1000;

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody String body,
            @RequestHeader(value = "x-signature") String signature,
            @RequestHeader(value = "x-timestamp") String timestampHeader) {

        if (!isWebhookEventValid(body, signature, timestampHeader)) {
            System.err.println("Invalid webhook signature");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid webhook signature");
        }

        System.out.println("Webhook received: " + body);
        return ResponseEntity.ok().build();
    }

    private boolean isWebhookEventValid(String body, String signature, String timestampHeader) {
        if (!StringUtils.hasText(signature) || !StringUtils.hasText(timestampHeader)) {
            return false;
        }

        long timestamp;
        try {
            timestamp = Long.parseLong(timestampHeader);
        } catch (NumberFormatException e) {
            return false;
        }

        long current = Instant.now().toEpochMilli();
        long diffTime = current - timestamp;
        if (diffTime >= MAX_ELAPSED_TIME) {
            return false;
        }

        String signedPayload = timestamp + "." + body;
        String expectedSignature = hmacSha256(signedPayload, API_KEY);

        return MessageDigest.isEqual(expectedSignature.getBytes(StandardCharsets.UTF_8),
                signature.getBytes(StandardCharsets.UTF_8));
    }

    private String hmacSha256(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate HMAC SHA-256", e);
        }
    }

    private String bytesToHex(byte[] hash) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
