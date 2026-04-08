package com.stock.test1;

import com.stock.test1.entities.Article;
import com.stock.test1.entities.Categorie;
import com.stock.test1.entities.Departement;
import com.stock.test1.repositories.ArticleRepository;
import com.stock.test1.repositories.CategorieRepository;
import com.stock.test1.repositories.DepartementRepository;
import com.stock.test1.security.entities.Role;
import com.stock.test1.security.entities.User;
import com.stock.test1.security.repositories.RoleRepository;
import com.stock.test1.security.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@SpringBootApplication
public class Test1Application {

    private static final int MIN_CATEGORIES = 12;
    private static final int MIN_DEPARTMENTS = 10;
    private static final int MIN_USERS = 12;
    private static final int MIN_ARTICLES = 20;

    public static void main(String[] args) {
        SpringApplication.run(Test1Application.class, args);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:*",
                "http://127.0.0.1:*"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public CommandLineRunner seedDatabase(
            CategorieRepository categorieRepository,
            DepartementRepository departementRepository,
            RoleRepository roleRepository,
            UserRepository userRepository,
            ArticleRepository articleRepository
    ) {
        return args -> {
            List<Categorie> categories = ensureCategories(categorieRepository);
            List<Departement> departments = ensureDepartments(departementRepository);
            List<Role> roles = ensureRoles(roleRepository);
            ensureUsers(userRepository, roles, departments);
            ensureArticles(articleRepository, categories);
        };
    }

    private List<Categorie> ensureCategories(CategorieRepository categorieRepository) {
        String[] baseNames = {
                "Informatique", "Bureautique", "Peripheriques", "Reseau", "Impression", "Mobilier",
                "Consommables", "Nettoyage", "Securite", "Maintenance", "Archives", "Divers"
        };

        Set<String> existingNames = new HashSet<>();
        for (Categorie categorie : categorieRepository.findAll()) {
            existingNames.add(categorie.getNom());
        }

        int idx = 0;
        while (categorieRepository.count() < MIN_CATEGORIES) {
            String nom = idx < baseNames.length ? baseNames[idx] : "Categorie " + (idx + 1);
            idx++;
            if (existingNames.contains(nom)) {
                continue;
            }

            Categorie categorie = new Categorie();
            categorie.setNom(nom);
            categorie.setDescription("Categorie " + nom + " pour les tests de gestion de stock");
            categorieRepository.save(categorie);
            existingNames.add(nom);
        }

        return categorieRepository.findAll();
    }

    private List<Departement> ensureDepartments(DepartementRepository departementRepository) {
        String[] baseNames = {
                "IT", "RH", "Finance", "Achats", "Ventes", "Logistique", "Marketing", "Support", "Qualite", "Direction"
        };

        Set<String> existingNames = new HashSet<>();
        for (Departement departement : departementRepository.findAll()) {
            existingNames.add(departement.getNomDep());
        }

        int idx = 0;
        while (departementRepository.count() < MIN_DEPARTMENTS) {
            String nom = idx < baseNames.length ? baseNames[idx] : "DEP_" + (idx + 1);
            idx++;
            if (existingNames.contains(nom)) {
                continue;
            }

            Departement departement = new Departement();
            departement.setNomDep(nom);
            departement.setChefDep("Chef " + nom);
            departementRepository.save(departement);
            existingNames.add(nom);
        }

        return departementRepository.findAll();
    }

    private List<Role> ensureRoles(RoleRepository roleRepository) {
        String[] roleNames = {"ADMIN", "MANAGER", "AGENT", "LECTEUR"};

        for (String roleName : roleNames) {
            if (roleRepository.findById(roleName).isEmpty()) {
                Role role = new Role();
                role.setNom(roleName);
                roleRepository.save(role);
            }
        }

        return roleRepository.findAll();
    }

    private void ensureUsers(
            UserRepository userRepository,
            List<Role> roles,
            List<Departement> departments
    ) {
        Set<String> existingNames = new HashSet<>();
        Set<String> existingEmails = new HashSet<>();
        for (User user : userRepository.findAll()) {
            existingNames.add(user.getNom());
            existingEmails.add(user.getEmail());
        }

        int idx = 1;
        while (userRepository.count() < MIN_USERS) {
            String username = "user" + idx;
            String email = username + "@stock.local";
            idx++;
            if (existingNames.contains(username) || existingEmails.contains(email)) {
                continue;
            }

            User user = new User();
            user.setId(UUID.randomUUID().toString());
            user.setNom(username);
            user.setEmail(email);
            user.setPassword("pass123");

            if (!roles.isEmpty()) {
                user.setRole(roles.get(ThreadLocalRandom.current().nextInt(roles.size())));
            }
            if (!departments.isEmpty()) {
                user.setDepartement(departments.get(ThreadLocalRandom.current().nextInt(departments.size())));
            }

            userRepository.save(user);
            existingNames.add(username);
            existingEmails.add(email);
        }
    }

    private void ensureArticles(ArticleRepository articleRepository, List<Categorie> categories) {
        if (categories.isEmpty()) {
            return;
        }

        cleanupInvalidArticles(articleRepository);

        Set<String> existingNames = new HashSet<>();
        for (Article article : articleRepository.findAll()) {
            existingNames.add(article.getNom());
        }

        List<String> productNames = new ArrayList<>(Arrays.asList(
                "Clavier mecanique", "Souris sans fil", "Ecran 24 pouces", "Imprimante laser", "Routeur pro",
                "Switch 24 ports", "Casque audio", "Webcam HD", "SSD 1To", "RAM 16Go",
                "Bureau ergonomique", "Chaise bureau", "Papier A4", "Stylo bleu", "Bloc-notes",
                "Disque externe", "Onduleur", "Hub USB-C", "Cable reseau", "Etiqueteuse"
        ));

        int idx = 0;
        while (articleRepository.count() < MIN_ARTICLES) {
            String nom = idx < productNames.size() ? productNames.get(idx) : "Article " + (idx + 1);
            idx++;
            if (existingNames.contains(nom)) {
                continue;
            }

            int stockMin = ThreadLocalRandom.current().nextInt(3, 15);
            int stockMax = ThreadLocalRandom.current().nextInt(40, 150);
            int stockReel = ThreadLocalRandom.current().nextInt(stockMin, stockMax + 1);

            Article article = new Article();
            article.setNom(nom);
            article.setDescription("Article de demonstration: " + nom);
            article.setPrix((float) ThreadLocalRandom.current().nextDouble(20.0, 2500.0));
            article.setStockMin(stockMin);
            article.setStockMax(stockMax);
            article.setStockReel(stockReel);
            article.setEtat(stockReel <= stockMin ? "ALERTE" : "DISPONIBLE");
            article.setCategorie(categories.get(ThreadLocalRandom.current().nextInt(categories.size())));

            articleRepository.save(article);
            existingNames.add(nom);
        }
    }

    private void cleanupInvalidArticles(ArticleRepository articleRepository) {
        List<Article> invalidArticles = articleRepository.findByNomIsNullOrNom("");
        if (!invalidArticles.isEmpty()) {
            articleRepository.deleteAll(invalidArticles);
        }
    }
}
