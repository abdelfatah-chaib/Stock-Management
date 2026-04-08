package com.stock.test1.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for direct integration with Groq API.
 */
@Service
public class AIExternalService {

    public static final String FALLBACK_ANALYSIS_MESSAGE = "AI analysis temporarily unavailable";

    private static final Logger log = LoggerFactory.getLogger(AIExternalService.class);
    private static final int GROQ_TIMEOUT_MS = 10_000;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}")
    private String groqApiUrl;

    @Value("${groq.api.key:}")
    private String groqApiKey;

    @Value("${groq.api.model:llama-3.1-8b-instant}")
    private String groqModel;

    public AIExternalService(ObjectMapper objectMapper) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(GROQ_TIMEOUT_MS);
        requestFactory.setReadTimeout(GROQ_TIMEOUT_MS);
        this.restTemplate = new RestTemplate(requestFactory);
        this.objectMapper = objectMapper;
    }

    public String analyzeStock(String articleName, int currentStock, int stockMin, int stockMax, List<Double> salesHistory) {
        if (groqApiKey == null || groqApiKey.isBlank()) {
            log.warn("Groq API key is missing. Returning fallback analysis.");
            return FALLBACK_ANALYSIS_MESSAGE;
        }

        try {
            boolean hasHistory = salesHistory != null && !salesHistory.isEmpty();
            String sales = !hasHistory
                ? "Historique limité"
                : salesHistory.stream()
                    .map(v -> String.format("%.0f", v))
                    .collect(Collectors.joining(","));

            double estimatedMonthlyConsumption = estimateMonthlyConsumption(articleName, currentStock, stockMin, stockMax);
            int estimatedDaysLeft = estimateDaysLeft(currentStock, estimatedMonthlyConsumption);
            int recommendedOrder = estimateRecommendedOrder(currentStock, stockMin, stockMax, estimatedMonthlyConsumption);

            String prompt = "Analyse ce stock et prédis le risque de rupture.\n\n"
                + "Article : " + articleName + "\n"
                + "Stock actuel : " + currentStock + "\n"
                + "Stock min : " + stockMin + "\n"
                + "Stock max : " + stockMax + "\n"
                + "Historique ventes : " + sales + "\n\n"
                + "Estimation de secours (a utiliser si historique faible):\n"
                + "- Consommation mensuelle estimée: " + String.format(Locale.US, "%.1f", estimatedMonthlyConsumption) + " unités/mois\n"
                + "- Jours restants estimés: " + estimatedDaysLeft + " jours\n"
                + "- Quantité recommandée estimée: " + recommendedOrder + " unités\n\n"
                + "Contraintes obligatoires:\n"
                + "1) Réponds en français professionnel, court et concret.\n"
                + "2) Ne dis jamais que la consommation est 0/jour ou 0/mois sauf si stock actuel = 0 et preuve explicite.\n"
                + "3) N'écris pas 'aucune vente historique disponible'. Si l'historique est insuffisant, utilise l'estimation de secours.\n"
                + "4) Donne toujours une action claire (commander maintenant / surveiller / pas d'action immédiate).\n"
                + "5) Respecte strictement ce format:\n"
                + "Consommation moyenne: X unités/jour (Y unités/mois)\n"
                + "Jours restants avant rupture: N jours\n"
                + "Action recommandée: ...\n"
                + "Quantité recommandée à commander: Q unités";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", groqModel);

            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", "Tu es un assistant expert en gestion de stock.");

            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", prompt);

            requestBody.put("messages", List.of(systemMessage, userMessage));
            requestBody.put("temperature", 0.2);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + groqApiKey);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            log.info("Calling Groq API once for article='{}'", articleName);
            String rawResponse = restTemplate.postForObject(groqApiUrl, request, String.class);
            JsonNode root = objectMapper.readTree(rawResponse);
            JsonNode content = root.path("choices").path(0).path("message").path("content");

            if (content.isMissingNode() || content.asText().isBlank()) {
                throw new RuntimeException("No content returned by Groq API");
            }

            return sanitizeAnalysis(content.asText().trim(), estimatedMonthlyConsumption, estimatedDaysLeft, recommendedOrder);
        } catch (ResourceAccessException timeoutEx) {
            log.warn("Groq API timeout or connectivity issue after {} ms: {}", GROQ_TIMEOUT_MS, timeoutEx.getMessage());
            return FALLBACK_ANALYSIS_MESSAGE;
        } catch (Exception e) {
            log.error("Error calling Groq API, returning fallback message", e);
            return FALLBACK_ANALYSIS_MESSAGE;
        }
    }

    private double estimateMonthlyConsumption(String articleName, int currentStock, int stockMin, int stockMax) {
        double span = Math.max(1, stockMax - stockMin);
        double pressure = currentStock <= stockMin ? 1.25 : (currentStock >= stockMax ? 0.75 : 1.0);
        double baseline = Math.max(1.0, Math.min(40.0, span * 0.12 * pressure));

        String name = articleName == null ? "" : articleName.toLowerCase(Locale.ROOT);
        if (name.contains("papier") || name.contains("stylo") || name.contains("bloc") || name.contains("cable")) {
            baseline *= 1.40;
        } else if (name.contains("laptop") || name.contains("imprimante") || name.contains("onduleur") || name.contains("routeur") || name.contains("switch")) {
            baseline *= 0.80;
        }

        return Math.max(0.8, Math.round(baseline * 10.0) / 10.0);
    }

    private int estimateDaysLeft(int currentStock, double monthlyConsumption) {
        if (currentStock <= 0) {
            return 0;
        }
        double daily = Math.max(0.05, monthlyConsumption / 30.0);
        return (int) Math.max(1, Math.round(currentStock / daily));
    }

    private int estimateRecommendedOrder(int currentStock, int stockMin, int stockMax, double monthlyConsumption) {
        int safetyTarget = (int) Math.ceil(Math.max(stockMin * 1.5, monthlyConsumption * 2.0));
        int target = stockMax > 0 ? Math.min(stockMax, safetyTarget) : safetyTarget;
        return Math.max(0, target - currentStock);
    }

    private String sanitizeAnalysis(String analysis, double monthlyConsumption, int daysLeft, int recommendedOrder) {
        String lower = analysis.toLowerCase(Locale.ROOT);
        boolean hasZeroConsumption = lower.contains("consommation moyenne: 0")
            || lower.contains("consommation moyenne de 0")
            || lower.contains("0 unité/jour")
            || lower.contains("0 unités/jour")
            || lower.contains("0 unité/mois")
            || lower.contains("0 unités/mois");

        if (hasZeroConsumption) {
            return buildControlledAnalysis(monthlyConsumption, daysLeft, recommendedOrder);
        }

        return analysis.replace("Aucune vente historique disponible", "Historique limité")
            .replace("aucune vente historique disponible", "historique limité");
    }

    private String buildControlledAnalysis(double monthlyConsumption, int daysLeft, int recommendedOrder) {
        double daily = Math.max(0.05, monthlyConsumption / 30.0);
        String action = daysLeft <= 30
            ? "Commander maintenant"
            : (daysLeft <= 90 ? "Planifier une commande préventive" : "Surveiller le stock hebdomadairement");

        return "Consommation moyenne: " + String.format(Locale.US, "%.2f", daily) + " unités/jour ("
            + String.format(Locale.US, "%.1f", monthlyConsumption) + " unités/mois)\n"
            + "Jours restants avant rupture: " + daysLeft + " jours\n"
            + "Action recommandée: " + action + "\n"
            + "Quantité recommandée à commander: " + recommendedOrder + " unités";
    }

    public boolean isConfigured() {
        return groqApiKey != null && !groqApiKey.isBlank();
    }
}
