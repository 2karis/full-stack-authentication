package com.example.api.bdd;

import org.junit.platform.suite.api.ConfigurationParameter;
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectPackages;
import org.junit.platform.suite.api.Suite;

import io.cucumber.junit.platform.engine.Constants;

/**
 * Test suite that lets Surefire discover the Cucumber scenarios: it only
 * picks up class-backed tests, so this empty suite hands execution over to
 * the Cucumber JUnit Platform engine. Feature files live in the test
 * resources under the same package path (features are found there by
 * @SelectPackages, glue classes in the same package).
 */
@Suite
@IncludeEngines("cucumber")
@SelectPackages("com.example.api.bdd")
@ConfigurationParameter(key = Constants.GLUE_PROPERTY_NAME, value = "com.example.api.bdd")
@ConfigurationParameter(key = Constants.PLUGIN_PROPERTY_NAME, value = "pretty,html:target/cucumber-report.html")
@ConfigurationParameter(key = Constants.PLUGIN_PUBLISH_QUIET_PROPERTY_NAME, value = "true")
public class RunCucumberTest {
}