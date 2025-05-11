package com.briefly.Service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.briefly.Model.Airequest;
import com.briefly.Model.GeminiResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class QnaService {

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Autowired
    private RestTemplate restTemplate;


    public String processContent(Airequest request) {
        String prompt = buildPrompt(request);

        // Create request body
        Map<String, Object> requestBody = Map.of(
            "contents", new Object[] {
                Map.of("parts", new Object[] {
                    Map.of("text", prompt)
                })
            }
        );

        // Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                geminiApiUrl + geminiApiKey,
                HttpMethod.POST,
                entity,
                String.class
            );

            return extractTextFromResponse(response.getBody());
        } catch (RestClientException e) {
            return "Request failed: " + e.getMessage();
        }
    }

    private String buildPrompt(Airequest request) {
        StringBuilder prompt = new StringBuilder();
        switch (request.getOperation()) {
            case "summarize":
                prompt.append("Provide a clear and concise summary of the following text in a few sentences:\n\n");
                break;
            default:
                throw new IllegalArgumentException("Unknown Operation: " + request.getOperation());
        }
        prompt.append(request.getContent());
        return prompt.toString();
    }

    private String extractTextFromResponse(String response) {
        try {
            GeminiResponse geminiResponse = objectMapper.readValue(response, GeminiResponse.class);
            if (geminiResponse.getCandidates() != null && !geminiResponse.getCandidates().isEmpty()) {
                GeminiResponse.Candidate candidate = geminiResponse.getCandidates().get(0);
                if (candidate.getContent() != null &&
                    candidate.getContent().getParts() != null &&
                    !candidate.getContent().getParts().isEmpty()) {
                    return candidate.getContent().getParts().get(0).getText();
                }
            }
            return "No content found in response";
        } catch (JsonProcessingException e) {
            return "Error parsing response: " + e.getMessage();
        }
    }
}
