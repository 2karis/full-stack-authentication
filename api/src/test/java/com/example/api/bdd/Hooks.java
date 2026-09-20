package com.example.api.bdd;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import io.cucumber.java.After;
import io.cucumber.java.BeforeAll;

/**
 * Verifies the deployment under test is reachable before any scenario runs,
 * and leaves the database without the rows a scenario created.
 */
public class Hooks {

	private final TestContext context;

	private static final HttpClient HTTP = HttpClient.newBuilder()
			.connectTimeout(Duration.ofSeconds(10))
			.build();

	public Hooks(TestContext context) {
		this.context = context;
	}

	@BeforeAll
	public static void requireRunningStack() {
		String failure = null;
		try {
			HttpRequest probe = HttpRequest.newBuilder(URI.create(TestSettings.BASE_URL + "/api/content"))
					.timeout(Duration.ofSeconds(5))
					.GET()
					.build();
			// Any answer - even 401 - proves the proxy and API are up.
			HTTP.send(probe, HttpResponse.BodyHandlers.discarding());
		} catch (Exception e) {
			failure = "The API is not reachable at " + TestSettings.BASE_URL + " (" + e.getMessage() + ").";
		}
		if (failure == null) {
			try {
				KeycloakClient.tokenFor("user");
			} catch (Exception e) {
				failure = "Cannot obtain tokens from Keycloak at " + TestSettings.TOKEN_URL + " ("
						+ e.getMessage() + ").";
			}
		}
		if (failure != null) {
			throw new IllegalStateException(failure
					+ " These are integration tests against the full running stack - start it first with"
					+ " `docker compose up --build -d`, or point the tests at a running deployment via"
					+ " the system property integration.base.url (and integration.keycloak.token-url).");
		}
	}

	@After
	public void deleteCreatedContent() {
		if (context.createdContentId < 0) {
			return;
		}
		// Best effort: the scenario may have deleted the row already, and the
		// postgres volume persists between test runs, so leftovers would show up
		// in later "get all" assertions.
		try {
			HttpRequest request = HttpRequest.newBuilder(
							URI.create(TestSettings.BASE_URL + "/api/content/" + context.createdContentId))
					.header("Authorization", "Bearer " + KeycloakClient.tokenFor("admin"))
					.timeout(Duration.ofSeconds(10))
					.DELETE()
					.build();
			HTTP.send(request, HttpResponse.BodyHandlers.discarding());
			context.createdContentId = -1;
		} catch (Exception ignored) {
			// Cleanup must never fail a passing scenario.
		}
	}
}