# ===== Stage 1: Build =====
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy Maven wrapper + pom.xml
COPY backend/.mvn/ backend/.mvn
COPY backend/mvnw backend/pom.xml backend/
RUN chmod +x backend/mvnw && cd backend && ./mvnw dependency:go-offline -B

# Copy source code backend
COPY backend/src backend/src

# Build jar
RUN cd backend && ./mvnw clean package -DskipTests

# ===== Stage 2: Run =====
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy jar từ stage build
COPY --from=build /app/backend/target/*.jar app.jar

# Copy database migrations cho Flyway (khớp filesystem:../database/migrations)
COPY database ../database

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
