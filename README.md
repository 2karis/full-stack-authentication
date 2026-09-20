# full-stack-authentication

## Integration tests

The Cucumber suite in [api](api) runs against the full deployed stack — Caddy
proxy, API, Keycloak and Postgres — with real tokens obtained from the
`fullstackauthentication` realm. Start the stack, then run the tests:

```bash
docker compose up --build -d
cd api
./mvnw test -Dtest=RunCucumberTest
```

Scenarios live in `api/src/test/resources/com/example/api/bdd/content.feature`
and cover the role-based access rules: reads require the `user` realm role,
writes require the `admin` realm role. The step definitions obtain tokens with
the same password grant the mobile app uses, call the API through the Caddy
proxy at `http://localhost:8001`, and delete the rows a scenario created so the
Postgres volume stays clean between runs.

Endpoints can be pointed at another deployment via system properties
(`integration.base.url`, `integration.keycloak.token-url`,
`integration.keycloak.client-id`) or the corresponding `INTEGRATION_*`
environment variables. An HTML report is written to
`api/target/cucumber-report.html`.