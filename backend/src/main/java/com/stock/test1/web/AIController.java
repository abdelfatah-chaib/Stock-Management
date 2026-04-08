package com.stock.test1.web;

import com.stock.test1.services.AIExternalService;
import com.stock.test1.entities.Article;
import com.stock.test1.entities.Demande;
import com.stock.test1.repositories.ArticleRepository;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for AI-powered stock predictions
 */
@RestController
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/ai")
public class AIController {

    private static final Logger log = LoggerFactory.getLogger(AIController.class);

    private AIExternalService aiExternalService;
    private ArticleRepository articleRepository;

    /**
     * Predict stock rupture for a specific article
     *
     * @param articleId The ID of the article to predict
     * @return Stock prediction response
     */
    @GetMapping("/analyze/{articleId}")
    public AIAnalysisResponse analyzeArticle(@PathVariable Long articleId) {
        try {
            log.info("AI analyze request started for articleId={}", articleId);

            Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found with id: " + articleId));

            String articleName = (article.getNom() == null || article.getNom().isBlank())
                ? ("Article #" + article.getId())
                : article.getNom();

            List<Double> salesHistory = extractSalesHistory(article);

            String analysis = aiExternalService.analyzeStock(
                articleName,
                article.getStockReel(),
                article.getStockMin(),
                article.getStockMax(),
                salesHistory
            );

            log.info("AI analyze request completed for articleId={}", articleId);

            return AIAnalysisResponse.builder()
                .article(articleName)
                .articleId(article.getId())
                .currentStock(article.getStockReel())
                .analysis(analysis)
                .status("success")
                .build();

        } catch (Exception e) {
            log.error("AI analyze request failed for articleId={}", articleId, e);
            return AIAnalysisResponse.builder()
                .status("error")
                .errorMessage(e.getMessage())
                .build();
        }
    }

    /**
     * Health check for AI service
     *
     * @return Health status
     */
    @GetMapping("/health")
    public HealthResponse checkAIServiceHealth() {
        boolean healthy = aiExternalService.isConfigured();
        return HealthResponse.builder()
            .status(healthy ? "healthy" : "unhealthy")
            .aiServiceReachable(healthy)
            .build();
    }

    /**
     * Lightweight list for AI page loading.
     */
    @GetMapping("/articles")
    public List<AIArticleSummary> getArticlesForAnalysis() {
        return articleRepository.findAll().stream()
            .filter(article -> article.getNom() != null && !article.getNom().isBlank())
            .map(article -> AIArticleSummary.builder()
                .id(article.getId())
                .nom(article.getNom())
                .stockReel(article.getStockReel())
                .stockMin(article.getStockMin())
                .stockMax(article.getStockMax())
                .prix(article.getPrix())
                .build())
            .collect(Collectors.toList());
    }

    /**
     * Extract sales history from article demands
     * Sorts demands by date and extracts quantities
     *
     * @param article The article to extract sales from
     * @return List of daily sales quantities
     */
    private List<Double> extractSalesHistory(Article article) {
        if (article.getDemandes() == null || article.getDemandes().isEmpty()) {
            return new ArrayList<>();
        }

        return article.getDemandes().stream()
            .sorted(Comparator.comparing(Demande::getDateD))
            .map(demande -> (double) demande.getNbA())
            .collect(Collectors.toList());
    }

    /**
     * DTO for AI analysis API response
     */
    @lombok.Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    @lombok.Builder
    public static class AIAnalysisResponse {
        private String status;
        private String errorMessage;
        private Long articleId;
        private String article;
        private double currentStock;
        private String analysis;
    }

    /**
     * DTO for health check response
     */
    @lombok.Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    @lombok.Builder
    public static class HealthResponse {
        private String status;
        private boolean aiServiceReachable;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    @lombok.Builder
    public static class AIArticleSummary {
        private Long id;
        private String nom;
        private int stockReel;
        private int stockMin;
        private int stockMax;
        private float prix;
    }
}
