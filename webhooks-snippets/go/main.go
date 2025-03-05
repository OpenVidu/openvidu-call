package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	SERVER_PORT      = "5080"
	API_KEY          = "meet-api-key"
	MAX_ELAPSED_TIME = 5 * time.Minute
)

func main() {
	router := gin.Default()
	router.POST("/webhook", handleWebhook)
	router.Run(":" + SERVER_PORT)
}

func handleWebhook(c *gin.Context) {
	var body map[string]interface{}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
		return
	}

	signature := c.GetHeader("x-signature")
	timestampStr := c.GetHeader("x-timestamp")
	timestamp, err := strconv.ParseInt(timestampStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid timestamp"})
		return
	}

	if !isWebhookEventValid(body, signature, timestamp) {
		log.Println("Invalid webhook signature")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid webhook signature"})
		return
	}

	event, _ := json.Marshal(body)
	log.Println("Webhook received:", string(event))
	c.Status(http.StatusOK)
}

func isWebhookEventValid(body map[string]interface{}, signature string, timestamp int64) bool {
	current := time.Now().UnixMilli()
	diffTime := current - timestamp
	if diffTime > MAX_ELAPSED_TIME.Milliseconds() {
		return false
	}

	bodyBytes, err := json.Marshal(body)
	if err != nil {
		return false
	}

	signedPayload := fmt.Sprintf("%d.%s", timestamp, string(bodyBytes))
	h := hmac.New(sha256.New, []byte(API_KEY))
	h.Write([]byte(signedPayload))
	expectedSignature := hex.EncodeToString(h.Sum(nil))

	return hmac.Equal([]byte(expectedSignature), []byte(signature))
}
