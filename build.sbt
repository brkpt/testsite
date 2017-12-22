name := """testsite"""
organization := "com.example"

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.12.3"

libraryDependencies ++= Seq(guice,javaJdbc,ws,
  "org.scalatestplus.play" %% "scalatestplus-play" % "3.1.2" % Test,
  "com.lucidchart" %% "relate" % "2.1.1",
  "mysql" % "mysql-connector-java" % "5.1.21"
)

resolvers += "Sonatype release repository" at "https://oss.sonatype.org/content/repositories/releases/"

// Adds additional packages into Twirl
//TwirlKeys.templateImports += "com.example.controllers._"

// Adds additional packages into conf/routes
// play.sbt.routes.RoutesKeys.routesImport += "com.example.binders._"
