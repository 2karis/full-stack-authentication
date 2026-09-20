package com.example.api.bdd;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * Minimal client for the Keycloak token endpoint. Uses the direct access
 * grant (resource owner password credentials) against the public "frontend"
 * client, the same flow the mobile app uses to log in. Tokens are cached per
 * user for the lifetime of the test run so each scenario does not hit
 * Keycloak more than once per set of credentials.
 */
final class KeycloakClient {

	private static final ObjectMapper JSON = new ObjectMapper();
	private static final Map<String, String> TOKEN_CACHE = new ConcurrentHashMap<>();

	private static final HttpClient HTTP = HttpClient.newBuilder()
			.connectTimeout(Duration.ofSeconds(10))
			.build();

	private KeycloakClient() {
	}

	static String tokenFor(String username) {
		return TOKEN_CACHE.computeIfAbsent(username, KeycloakClient::fetchToken);
	}

	/** Reads the {@code sub} claim of an access token without verifying it. */
	static String subjectOf(String accessToken) {
		try {
			String payload = accessToken.split("\\.")[1];
			JsonNode claims = JSON.readTree(Base64.getUrlDecoder().decode(payload));
			return claims.get("sub").asText();
		} catch (Exception e) {
			throw new IllegalStateException("Cannot read subject claim from access token", e);
		}
	}

	private static String fetchToken(String username) {
		String form = "grant_type=password"
				+ "&client_id=" + URLEncoder.encode(TestSettings.CLIENT_ID, StandardCharsets.UTF_8)
				+ "&username=" + URLEncoder.encode(username, StandardCharsets.UTF_8)
				+ "&password=" + URLEncoder.encode(TestSettings.USER_PASSWORD, StandardCharsets.UTF_8);

		HttpRequest request = HttpRequest.newBuilder(URI.create(TestSettings.TOKEN_URL))
				.header("Content-Type", "application/x-www-form-urlencoded")
				.timeout(Duration.ofSeconds(10))
				.POST(HttpRequest.BodyPublishers.ofString(form))
				.build();

		try {
			HttpResponse<String> response = HTTP.send(request, HttpResponse.BodyHandlers.ofString());
			if (response.statusCode() != 200) {
				throw new IllegalStateException("Keycloak rejected the password grant for user '" + username
						+ "' (status " + response.statusCode() + "): " + response.body());
			}
			return JSON.readTree(response.body()).get("access_token").asText();
		} catch (IllegalStateException e) {
			throw e;
		} catch (Exception e) {
			throw new IllegalStateException("Failed to obtain a token from " + TestSettings.TOKEN_URL, e);
		}
	}
}