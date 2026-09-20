package com.example.api.bdd;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

/**
 * Steps that send requests to the content API and assert on the responses.
 * The placeholder {id} in a path refers to the content created most recently
 * within the same scenario.
 */
public class ContentSteps {

	private final TestContext context;

	private final ObjectMapper json = new ObjectMapper();
	private final HttpClient http = HttpClient.newBuilder()
			.connectTimeout(Duration.ofSeconds(10))
			.build();

	public ContentSteps(TestContext context) {
		this.context = context;
	}

	@When("I send a GET request to {string}")
	public void iSendAGetRequestTo(String path) {
		send("GET", path, null);
	}

	@When("I send a DELETE request to {string}")
	public void iSendADeleteRequestTo(String path) {
		send("DELETE", path, null);
	}

	@When("I send a PUT request to {string} with title {string} and description {string}")
	public void iSendAPutRequestToWith(String path, String title, String description) {
		send("PUT", path, contentBody(title, description));
	}

	@When("I create content with title {string} and description {string}")
	public void iCreateContentWith(String title, String description) {
		send("POST", "/api/content", contentBody(title, description));
		if (context.lastStatus == 201) {
			context.createdContentId = responseBody().get("id").asLong();
		}
	}

	@Then("the response status should be {int}")
	public void theResponseStatusShouldBe(int expected) {
		assertEquals(expected, context.lastStatus,
				"Unexpected status in response body: " + context.lastBody);
	}

	@Then("the response body should be a JSON array")
	public void theResponseBodyShouldBeAJsonArray() {
		assertTrue(responseBody().isArray(),
				"Expected a JSON array but the body is: " + context.lastBody);
	}

	@Then("the response field {string} should be {string}")
	public void theResponseFieldShouldBe(String field, String expected) {
		JsonNode value = responseBody().get(field);
		if (value == null || value.isNull()) {
			fail("Expected field '" + field + "' to be '" + expected + "' but it is missing. Body: "
					+ context.lastBody);
		}
		assertEquals(expected, value.asText(),
				"Wrong value of field '" + field + "' in response body: " + context.lastBody);
	}

	@Then("the response field {string} should equal the token subject")
	public void theResponseFieldShouldEqualTheTokenSubject(String field) {
		String subject = KeycloakClient.subjectOf(context.accessToken);
		assertEquals(subject, responseBody().get(field).asText(),
				"Field '" + field + "' should carry the id of the token's user (" + subject
						+ "): " + context.lastBody);
	}

	private String contentBody(String title, String description) {
		ObjectNode body = json.createObjectNode();
		body.put("title", title);
		body.put("description", description);
		return body.toString();
	}

	private JsonNode responseBody() {
		try {
			return json.readTree(context.lastBody);
		} catch (Exception e) {
			throw new IllegalStateException("Response body is not valid JSON: " + context.lastBody, e);
		}
	}

	private void send(String method, String path, String body) {
		String url = TestSettings.BASE_URL + path.replace("{id}", String.valueOf(context.createdContentId));
		HttpRequest.Builder request = HttpRequest.newBuilder(URI.create(url))
				.timeout(Duration.ofSeconds(10))
				.header("Accept", "application/json");
		if (context.accessToken != null) {
			request.header("Authorization", "Bearer " + context.accessToken);
		}
		HttpRequest.BodyPublisher publisher = body == null
				? HttpRequest.BodyPublishers.noBody()
				: HttpRequest.BodyPublishers.ofString(body);
		if (body != null) {
			request.header("Content-Type", "application/json");
		}
		try {
			HttpResponse<String> response = http.send(request.method(method, publisher).build(),
					HttpResponse.BodyHandlers.ofString());
			context.lastStatus = response.statusCode();
			context.lastBody = response.body();
		} catch (Exception e) {
			throw new IllegalStateException("Request " + method + " " + url + " failed", e);
		}
	}
}