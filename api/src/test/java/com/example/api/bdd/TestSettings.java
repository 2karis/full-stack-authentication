package com.example.api.bdd;

/**
 * Endpoints of the running full-stack deployment the integration tests run
 * against. Values can be overridden through system properties or environment
 * variables, e.g. when the stack is reachable under different host names.
 *
 * Defaults match the docker-compose setup: the Caddy proxy publishes the API
 * on http://localhost:8001 and Keycloak runs on http://localhost:8080.
 */
final class TestSettings {

	/** Base URL of the API as published by the Caddy proxy. */
	static final String BASE_URL = setting("integration.base.url", "INTEGRATION_BASE_URL",
			"http://localhost:8001");

	/** Keycloak token endpoint of the fullstackauthentication realm. */
	static final String TOKEN_URL = setting("integration.keycloak.token-url", "INTEGRATION_KEYCLOAK_TOKEN_URL",
			"http://localhost:8080/realms/fullstackauthentication/protocol/openid-connect/token");

	/** OpenID Connect client used for password grants. */
	static final String CLIENT_ID = setting("integration.keycloak.client-id", "INTEGRATION_KEYCLOAK_CLIENT_ID",
			"frontend");

	/**
	 * Password shared by the realm's test users (admin and user), as defined by
	 * the imported realm keycloak/realm-fullstackauthentication.json.
	 */
	static final String USER_PASSWORD = "password";

	private TestSettings() {
	}

	private static String setting(String propertyName, String envVar, String defaultValue) {
		String value = System.getProperty(propertyName);
		if (value == null) {
			value = System.getenv(envVar);
		}
		return value != null ? value : defaultValue;
	}
}