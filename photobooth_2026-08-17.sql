-- MySQL dump 10.13  Distrib 8.4.10, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: photobooth_saas
-- ------------------------------------------------------
-- Server version	8.4.10-0ubuntu0.26.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Analytics`
--

DROP TABLE IF EXISTS `Analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Analytics` (
  `id` varchar(255) NOT NULL,
  `printed` tinyint(1) DEFAULT '0',
  `whatsapp` tinyint(1) DEFAULT '0',
  `qr` tinyint(1) DEFAULT '0',
  `eventId` varchar(255) DEFAULT 'global_default',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Analytics`
--

LOCK TABLES `Analytics` WRITE;
/*!40000 ALTER TABLE `Analytics` DISABLE KEYS */;
INSERT INTO `Analytics` VALUES ('photo_1786184835756.jpg',0,0,0,'global_default','2026-08-08 10:27:15'),('photo_1786184842535.jpg',0,0,0,'global_default','2026-08-08 10:27:22'),('photo_1786184851125.jpg',0,0,0,'global_default','2026-08-08 10:27:31'),('photo_1786186252199.jpg',0,0,0,'global_default','2026-08-08 10:50:52'),('photo_1786264464074.jpg',0,0,0,'global_default','2026-08-09 08:34:24'),('photo_1786264466899.jpg',0,0,0,'global_default','2026-08-09 08:34:26'),('photo_1786264469876.jpg',0,0,0,'global_default','2026-08-09 08:34:29'),('photo_1786267547063.jpg',0,0,0,'global_default','2026-08-09 09:25:47'),('photo_1786267586981.jpg',0,0,0,'global_default','2026-08-09 09:26:26'),('photo_1786267659213.jpg',0,0,0,'global_default','2026-08-09 09:27:39'),('photo_1786267702569.jpg',0,0,0,'global_default','2026-08-09 09:28:22'),('photo_1786267719517.jpg',0,0,0,'global_default','2026-08-09 09:28:39'),('photo_1786268192572.jpg',0,0,0,'global_default','2026-08-09 09:36:32'),('photo_1786271917245.jpg',0,0,0,'global_default','2026-08-09 10:38:37'),('photo_1786271927080.jpg',0,0,0,'global_default','2026-08-09 10:38:47'),('photo_1786273750767.jpg',0,0,0,'global_default','2026-08-09 11:09:10'),('photo_1786273753838.jpg',0,0,0,'global_default','2026-08-09 11:09:13'),('photo_1786274281770.jpg',0,0,0,'global_default','2026-08-09 11:18:01'),('photo_1786276547473.jpg',0,0,0,'global_default','2026-08-09 11:55:47'),('photo_1786289414973.jpg',0,0,0,'global_default','2026-08-09 15:30:14'),('photo_1786357796067.jpg',0,0,0,'global_default','2026-08-10 10:29:56'),('photo_1786523068485.jpg',0,0,0,'global_default','2026-08-12 08:24:28'),('photo_1786528611017.jpg',0,0,0,'global_default','2026-08-12 09:56:51'),('photo_1786528920199.jpg',0,0,0,'global_default','2026-08-12 10:02:00'),('photo_1786529117142.jpg',0,0,0,'global_default','2026-08-12 10:05:17'),('photo_1786529242358.jpg',0,0,0,'global_default','2026-08-12 10:07:22'),('photo_1786529345504.jpg',0,0,0,'global_default','2026-08-12 10:09:05'),('photo_1786530110937.jpg',0,0,0,'global_default','2026-08-12 10:21:50'),('photo_1786530212694.jpg',0,0,0,'global_default','2026-08-12 10:23:32'),('photo_1786530672789.jpg',0,0,0,'global_default','2026-08-12 10:31:12'),('photo_1786530719024.jpg',0,0,0,'global_default','2026-08-12 10:31:59'),('photo_1786534160679.jpg',0,0,0,'global_default','2026-08-12 11:29:20'),('photo_1786534720950.jpg',0,0,0,'global_default','2026-08-12 11:38:40'),('photo_1786534858537.jpg',0,0,0,'global_default','2026-08-12 11:40:58'),('photo_1786535028987.jpg',0,0,0,'global_default','2026-08-12 11:43:48'),('photo_1786537613536.jpg',0,0,0,'global_default','2026-08-12 12:26:53'),('photo_1786607272574.jpg',0,0,0,'global_default','2026-08-13 07:47:52'),('photo_1786607345267.jpg',0,0,0,'global_default','2026-08-13 07:49:05'),('photo_1786607457824.jpg',0,0,0,'global_default','2026-08-13 07:50:57'),('photo_1786610041695.jpg',0,0,0,'global_default','2026-08-13 08:34:01'),('photo_1786610332785.jpg',0,0,0,'global_default','2026-08-13 08:38:52'),('photo_1786610446319.jpg',0,0,0,'global_default','2026-08-13 08:40:46'),('photo_1786611832840.jpg',0,0,0,'global_default','2026-08-13 09:03:52'),('photo_1786612010209.jpg',0,0,0,'global_default','2026-08-13 09:06:50'),('photo_1786612215019.jpg',0,0,0,'global_default','2026-08-13 09:10:15'),('photo_1786612444610.jpg',0,0,0,'global_default','2026-08-13 09:14:04'),('photo_1786614686435.jpg',0,0,0,'global_default','2026-08-13 09:51:26'),('photo_1786614795526.jpg',0,0,0,'global_default','2026-08-13 09:53:15'),('photo_1786614806770.jpg',0,0,0,'global_default','2026-08-13 09:53:26'),('photo_1786614863124.jpg',0,0,0,'global_default','2026-08-13 09:54:23'),('photo_1786614925577.jpg',0,0,0,'global_default','2026-08-13 09:55:25'),('photo_1786614977363.jpg',0,0,0,'global_default','2026-08-13 09:56:17'),('photo_1786615122801.jpg',0,0,0,'global_default','2026-08-13 09:58:42'),('photo_1786615336692.jpg',0,0,0,'global_default','2026-08-13 10:02:16'),('photo_1786615740922.jpg',0,0,0,'global_default','2026-08-13 10:09:00'),('photo_1786616173056.jpg',0,0,0,'global_default','2026-08-13 10:16:13'),('photo_1786617895577.jpg',0,0,0,'global_default','2026-08-13 10:44:55');
/*!40000 ALTER TABLE `Analytics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Licenses`
--

DROP TABLE IF EXISTS `Licenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Licenses` (
  `hardwareId` varchar(255) NOT NULL,
  `shortCode` varchar(10) DEFAULT NULL,
  `validated` tinyint(1) DEFAULT '0',
  `selfieCount` int DEFAULT '0',
  `validatedAt` timestamp NULL DEFAULT NULL,
  `printers` text,
  `selectedPrinter` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`hardwareId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Licenses`
--

LOCK TABLES `Licenses` WRITE;
/*!40000 ALTER TABLE `Licenses` DISABLE KEYS */;
INSERT INTO `Licenses` VALUES ('36AD-D235-EEAA','579248',1,101,'2026-08-09 08:34:16','[{\"name\":\"Microsoft Print to PDF\",\"displayName\":\"Microsoft Print to PDF\",\"description\":\"\",\"options\":{}},{\"name\":\"EPSON PM-520 Series\",\"displayName\":\"EPSON PM-520 Series\",\"description\":\"\",\"options\":{}}]','EPSON PM-520 Series'),('40BB-BE14-2F08','528653',1,1,'2026-08-09 11:24:44','[{\"name\":\"Send To OneNote 2013\",\"displayName\":\"Send To OneNote 2013\",\"description\":\"\",\"options\":{}},{\"name\":\"Microsoft XPS Document Writer\",\"displayName\":\"Microsoft XPS Document Writer\",\"description\":\"\",\"options\":{}},{\"name\":\"Microsoft Print to PDF\",\"displayName\":\"Microsoft Print to PDF\",\"description\":\"\",\"options\":{}},{\"name\":\"Fax\",\"displayName\":\"Fax\",\"description\":\"\",\"options\":{}}]',NULL),('4383-D6B5-2DF3','371851',0,0,NULL,'[{\"name\":\"Send To OneNote 16\",\"displayName\":\"Send To OneNote 16\",\"description\":\"\",\"options\":{}},{\"name\":\"Microsoft XPS Document Writer\",\"displayName\":\"Microsoft XPS Document Writer\",\"description\":\"\",\"options\":{}},{\"name\":\"Microsoft Print to PDF\",\"displayName\":\"Microsoft Print to PDF\",\"description\":\"\",\"options\":{}},{\"name\":\"Fax\",\"displayName\":\"Fax\",\"description\":\"\",\"options\":{}}]',NULL),('A037-AC4E-BAF7','561620',1,20,'2026-08-09 11:24:42','[{\"name\":\"EPSON PM-520 Series\",\"displayName\":\"EPSON PM-520 Series\",\"description\":\"\",\"options\":{}},{\"name\":\"Send To OneNote 2013\",\"displayName\":\"Send To OneNote 2013\",\"description\":\"\",\"options\":{}},{\"name\":\"Microsoft XPS Document Writer\",\"displayName\":\"Microsoft XPS Document Writer\",\"description\":\"\",\"options\":{}},{\"name\":\"Microsoft Print to PDF\",\"displayName\":\"Microsoft Print to PDF\",\"description\":\"\",\"options\":{}},{\"name\":\"Fax\",\"displayName\":\"Fax\",\"description\":\"\",\"options\":{}},{\"name\":\"EPSON L4260 Series\",\"displayName\":\"EPSON L4260 Series\",\"description\":\"EPSON L4260 Series\",\"options\":{}}]',NULL),('BROWSER-DEV-MODE','310995',1,8,'2026-08-09 07:35:28',NULL,NULL),('D62A-54E7-170B','892083',1,1,'2026-08-09 11:24:39',NULL,NULL);
/*!40000 ALTER TABLE `Licenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  `companyId` varchar(36) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-17 15:20:38
