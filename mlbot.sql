-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主机： localhost
-- 生成日期： 2024-11-30 18:04:20
-- 服务器版本： 8.0.37
-- PHP 版本： 8.2.23

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 数据库： `mlbot`
--

-- --------------------------------------------------------

--
-- 表的结构 `records`
--

CREATE TABLE `records` (
  `id` int NOT NULL,
  `mlk` text COLLATE utf8mb4_general_ci NOT NULL,
  `mkey` tinytext COLLATE utf8mb4_general_ci NOT NULL,
  `skey` tinytext COLLATE utf8mb4_general_ci NOT NULL,
  `owner` bigint NOT NULL DEFAULT '0',
  `mgroup_id` text COLLATE utf8mb4_general_ci NOT NULL,
  `pack_id` tinytext COLLATE utf8mb4_general_ci,
  `desta` int NOT NULL,
  `destb` int DEFAULT NULL,
  `destc` int DEFAULT NULL,
  `name` text COLLATE utf8mb4_general_ci,
  `views` int NOT NULL DEFAULT '0',
  `exp` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 转储表的索引
--

--
-- 表的索引 `records`
--
ALTER TABLE `records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mlk_idx` (`mlk`(64));

--
-- 在导出的表使用AUTO_INCREMENT
--

--
-- 使用表AUTO_INCREMENT `records`
--
ALTER TABLE `records`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
