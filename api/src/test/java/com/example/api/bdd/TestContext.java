package com.example.api.bdd;

/**
 * Mutable state shared between the step definition classes of a single
 * scenario. Cucumber (via picocontainer) creates one instance per scenario
 * and injects it into every step class that declares it as a constructor
 * argument.
 */
public class TestContext {

	/** Bearer token used for the next request, or null for anonymous access. */
	String accessToken;

	int lastStatus;
	String lastBody;

	/** Id of the content most recently created through a step, or -1. */
	long createdContentId = -1;
}