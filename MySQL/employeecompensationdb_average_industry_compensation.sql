-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: localhost    Database: employeecompensationdb
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `average_industry_compensation`
--

DROP TABLE IF EXISTS `average_industry_compensation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `average_industry_compensation` (
  `Location` text,
  `Role` text,
  `Average Industry Compensation` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `average_industry_compensation`
--

LOCK TABLES `average_industry_compensation` WRITE;
/*!40000 ALTER TABLE `average_industry_compensation` DISABLE KEYS */;
INSERT INTO `average_industry_compensation` VALUES ('Jaipur','Analyst','5,70,000'),('Pune','Analyst','6,30,000'),('Banglore','Analyst','6,60,000'),('Jaipur','Associate','10,38,825'),('Pune','Associate','11,48,175'),('Banglore','Associate','12,02,850'),('Jaipur','Manager','23,37,356'),('Pune','Manager','25,83,394'),('Banglore','Manager','27,06,413'),('Jaipur','Senior Analyst','7,69,500'),('Pune','Senior Analyst','8,50,500'),('Banglore','Senior Analyst','8,91,000'),('Jaipur','Senior Associate','15,58,238'),('Pune','Senior Associate','17,22,263'),('Banglore','Senior Associate','18,04,275');
/*!40000 ALTER TABLE `average_industry_compensation` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-18 16:24:12
