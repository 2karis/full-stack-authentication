FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app

# Retry on flaky downloads: Maven Central connections from Docker sometimes
# truncate mid-artifact, which would otherwise fail the whole build.
COPY pom.xml .
RUN mvn -q dependency:go-offline || \
    (sleep 10 && mvn -q dependency:go-offline) || \
    (sleep 30 && mvn -q dependency:go-offline)

COPY src src
RUN mvn -q package -DskipTests

FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

COPY --from=build /app/target/api-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 7000

ENTRYPOINT ["java", "-jar", "app.jar"]