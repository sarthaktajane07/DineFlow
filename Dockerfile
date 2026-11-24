# Multi-stage Dockerfile for Spring Boot 3 on Java 21 (from repository root)

# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy Maven wrapper & pom.xml from backend-java
COPY backend-java/pom.xml .
COPY backend-java/.mvn .mvn
COPY backend-java/mvnw .

# Download dependencies (cached layer)
RUN ./mvnw dependency:go-offline -B || true

# Copy source code and build
COPY backend-java/src src
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S dineflow && adduser -S dineflow -G dineflow
USER dineflow:dineflow

# Copy built jar
COPY --from=build --chown=dineflow:dineflow /app/target/*.jar app.jar

EXPOSE 5000

ENV PORT=5000
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
