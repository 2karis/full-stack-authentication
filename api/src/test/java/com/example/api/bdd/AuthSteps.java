package com.example.api.bdd;

import io.cucumber.java.en.Given;

/** Steps that establish who the next request is authenticated as. */
public class AuthSteps {

	private final TestContext context;

	public AuthSteps(TestContext context) {
		this.context = context;
	}

	@Given("I am authenticated as {string}")
	public void iAmAuthenticatedAs(String username) {
		context.accessToken = KeycloakClient.tokenFor(username);
	}

	@Given("I am not authenticated")
	public void iAmNotAuthenticated() {
		context.accessToken = null;
	}
}