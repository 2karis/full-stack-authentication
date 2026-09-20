Feature: Content API access control and CRUD
  The API exposes content resources whose access is governed by Keycloak
  realm roles: reads require the "user" role and writes require the "admin"
  role. Scenarios run against the full deployed stack - Caddy proxy, API,
  Keycloak and Postgres - with real tokens obtained from the realm.

  Background:
    Given I am not authenticated

  Scenario: Anonymous requests are rejected
    When I send a GET request to "/api/content"
    Then the response status should be 401

  Scenario: A user with the "user" role can read content
    Given I am authenticated as "user"
    When I send a GET request to "/api/content"
    Then the response status should be 200
    And the response body should be a JSON array

  Scenario: A user cannot create content
    Given I am authenticated as "user"
    When I create content with title "Cucumber forbidden" and description "A plain user must not be able to write"
    Then the response status should be 403

  Scenario: An admin can create content
    Given I am authenticated as "admin"
    When I create content with title "Cucumber created" and description "Created by an integration test"
    Then the response status should be 201
    And the response field "title" should be "Cucumber created"
    And the response field "createdBy" should equal the token subject

  Scenario: Created content can be fetched by id
    Given I am authenticated as "admin"
    When I create content with title "Cucumber fetch by id" and description "Looked up right after creation"
    Then the response status should be 201
    When I send a GET request to "/api/content/{id}"
    Then the response status should be 200
    And the response field "title" should be "Cucumber fetch by id"

  Scenario: Fetching unknown content returns 404
    Given I am authenticated as "user"
    When I send a GET request to "/api/content/9999999"
    Then the response status should be 404

  Scenario: An admin can update content
    Given I am authenticated as "admin"
    When I create content with title "Cucumber before update" and description "Original description"
    Then the response status should be 201
    When I send a PUT request to "/api/content/{id}" with title "Cucumber after update" and description "Updated description"
    Then the response status should be 200
    And the response field "title" should be "Cucumber after update"
    And the response field "description" should be "Updated description"

  Scenario: A user cannot update content
    Given I am authenticated as "user"
    When I send a PUT request to "/api/content/9999999" with title "Cucumber forbidden" and description "A plain user must not be able to write"
    Then the response status should be 403

  Scenario: An admin can delete content
    Given I am authenticated as "admin"
    When I create content with title "Cucumber to be deleted" and description "Removed by the admin role"
    Then the response status should be 201
    When I send a DELETE request to "/api/content/{id}"
    Then the response status should be 200
    When I send a GET request to "/api/content/{id}"
    Then the response status should be 404

  Scenario: A user cannot delete content
    Given I am authenticated as "user"
    When I send a DELETE request to "/api/content/9999999"
    Then the response status should be 403