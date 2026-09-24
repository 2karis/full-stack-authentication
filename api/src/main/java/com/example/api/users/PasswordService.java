package com.example.api.users;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

/**
 * Changes a user's password on their behalf by proxying Keycloak: Keycloak has
 * no self-service password REST endpoint, so the API verifies the caller's
 * current password with the token endpoint, then resets the password through
 * the Admin REST API using a service account. The admin credentials never
 * leave the server.
 */
@Service
public class PasswordService {

	/** Thrown when the caller's current password does not verify. */
	public static class WrongPasswordException extends RuntimeException {
	}

	private static final String FRONTEND_CLIENT_ID = "frontend";

	private final RestClient restClient;
	private final String baseUrl;
	private final String realm;
	private final String adminClientId;
	private final String adminClientSecret;

	public PasswordService(
			RestClient.Builder builder,
			@Value("${keycloak.base-url}") String baseUrl,
			@Value("${keycloak.realm}") String realm,
			@Value("${keycloak.admin-client-id}") String adminClientId,
			@Value("${keycloak.admin-client-secret}") String adminClientSecret) {
		this.restClient = builder.build();
		this.baseUrl = baseUrl;
		this.realm = realm;
		this.adminClientId = adminClientId;
		this.adminClientSecret = adminClientSecret;
	}

	public void changePassword(Jwt jwt, String currentPassword, String newPassword) {
		verifyCurrentPassword(jwt.getClaimAsString("preferred_username"), currentPassword);
		String adminToken = serviceAccountToken();
		restClient.put()
				.uri("%s/admin/realms/%s/users/%s/reset-password".formatted(baseUrl, realm, jwt.getSubject()))
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
				.contentType(MediaType.APPLICATION_JSON)
				.body(Map.of("value", newPassword, "temporary", false))
				.retrieve()
				.toBodilessEntity();
	}

	/**
	 * Re-issue a password-grant token for the user: if the token endpoint
	 * rejects the credentials, the current password is wrong. Keycloak answers
	 * 400 invalid_grant (not 401) for a bad password.
	 */
	private void verifyCurrentPassword(String username, String currentPassword) {
		MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
		form.add("grant_type", "password");
		form.add("client_id", FRONTEND_CLIENT_ID);
		form.add("username", username);
		form.add("password", currentPassword);
		try {
			tokenRequest(form);
		} catch (RestClientResponseException e) {
			throw new WrongPasswordException();
		}
	}

	/** Token for the service account the API uses to call the Admin REST API. */
	private String serviceAccountToken() {
		MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
		form.add("grant_type", "client_credentials");
		form.add("client_id", adminClientId);
		form.add("client_secret", adminClientSecret);
		Map<String, Object> body = tokenRequest(form);
		return (String) body.get("access_token");
	}

	private Map<String, Object> tokenRequest(MultiValueMap<String, String> form) {
		return restClient.post()
				.uri("%s/realms/%s/protocol/openid-connect/token".formatted(baseUrl, realm))
				.contentType(MediaType.APPLICATION_FORM_URLENCODED)
				.body(form)
				.retrieve()
				.body(Map.class);
	}
}