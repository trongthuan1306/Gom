@REM Maven Wrapper for Windows
@ECHO OFF
SETLOCAL
chcp 65001 >NUL
SET "WRAPPER_DIR=%~dp0.mvn\wrapper"
IF NOT EXIST "%WRAPPER_DIR%\maven-wrapper.jar" (
  ECHO Missing .mvn\wrapper\maven-wrapper.jar
  EXIT /B 1
)
java -Dmaven.multiModuleProjectDirectory=. -cp ".mvn\wrapper\maven-wrapper.jar" org.apache.maven.wrapper.MavenWrapperMain %*
SET "MVNW_EXIT=%ERRORLEVEL%"
ENDLOCAL & EXIT /B %MVNW_EXIT%
