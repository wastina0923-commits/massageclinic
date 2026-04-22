BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "bookings" (
	"id"	INTEGER,
	"appointmentDate"	TEXT NOT NULL,
	"appointmentTime"	TEXT NOT NULL,
	"customerName"	TEXT NOT NULL,
	"phone"	TEXT NOT NULL,
	"insurance"	TEXT,
	"therapist"	TEXT NOT NULL,
	"treatment"	TEXT NOT NULL,
	"totalPrice"	REAL NOT NULL,
	"insuranceClaim"	REAL NOT NULL,
	"gapPayment"	REAL NOT NULL,
	"paymentMethod"	TEXT NOT NULL,
	"createdAt"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	"therapyDuration"	INTEGER,
	"endTime"	TEXT,
	"hotStone"	INTEGER DEFAULT 0,
	"aroma"	INTEGER DEFAULT 0,
	"guaSha"	INTEGER DEFAULT 0,
	"deepTissue"	INTEGER DEFAULT 0,
	"cupping"	INTEGER DEFAULT 0,
	"tigerBalm"	INTEGER DEFAULT 0,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "customers" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL UNIQUE,
	"phone"	TEXT,
	"insurance"	TEXT,
	"createdAt"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER,
	"username"	TEXT NOT NULL UNIQUE,
	"password"	TEXT NOT NULL,
	"role"	TEXT DEFAULT 'user',
	"createdAt"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT)
);
INSERT INTO "bookings" VALUES (5,'2026-04-16','12:40','Kelly Chen','0494628383',NULL,'Jacky','head-neck-shoulder',40.0,15.0,25.0,'card','2026-04-12 07:14:39',20,'13:00',0,0,0,0,0,0);
INSERT INTO "bookings" VALUES (9,'2026-04-16','12:05','Wang Lin','0483729593','ERTPEKE32','Melody','upper-body',90.0,45.0,45.0,'card','2026-04-16 06:11:04',60,'13:05',0,0,0,0,0,0);
INSERT INTO "bookings" VALUES (14,'2026-04-18','09:30','Edward Wang','0483759606','ADDINS01','Alice','head-neck-shoulder',60.0,0.0,60.0,'card','2026-04-18 01:32:58',30,'10:00',0,0,1,0,0,0);
INSERT INTO "bookings" VALUES (15,'2026-04-18','09:34','Pei-Rung Cai','0494628383','WIE492302','Joanna','foot',75.0,15.0,60.0,'cash','2026-04-18 01:34:35',45,'10:19',0,0,0,0,0,1);
INSERT INTO "bookings" VALUES (17,'2026-04-20','11:46','Edward Wang','0483759606','ADDINS01','Joanna','Full-body',75.0,45.0,30.0,'card','2026-04-20 13:47:09',45,'12:31',1,0,0,0,0,0);
INSERT INTO "bookings" VALUES (18,'2026-04-21','08:00','Leo Hsieh','0483846578','ER3937302','Coco','head-neck-shoulder',95.0,0.0,95.0,'cash','2026-04-20 14:16:21',60,'09:00',1,0,0,0,0,0);
INSERT INTO "bookings" VALUES (19,'2026-04-21','09:00','Wang Lin','0483729593','ERTPEKE32','Jacky','back-feet',55.0,0.0,55.0,'card','2026-04-20 14:24:48',30,'09:30',0,0,0,0,0,1);
INSERT INTO "bookings" VALUES (20,'2026-04-21','08:40','Pei-Rung Cai','0494628383','WIE492302','Sunny','Full-body',75.0,0.0,75.0,'card','2026-04-20 14:32:47',40,'09:20',1,0,0,1,0,0);
INSERT INTO "bookings" VALUES (21,'2026-04-21','09:30','Test','0483794949','QWE345','Kelly','lower-body',100.0,45.0,55.0,'card','2026-04-20 14:33:34',60,'10:30',1,1,0,0,0,0);
INSERT INTO "bookings" VALUES (22,'2026-04-21','10:00','Jia Guo','0412936847','EVE3444','Helen','Full-body',130.0,60.0,70.0,'cash','2026-04-20 14:34:26',90,'11:30',0,0,0,0,0,0);
INSERT INTO "bookings" VALUES (23,'2026-04-21','11:20','Amy Fan','0467834948','ECD345','Coco','head-neck-shoulder',70.0,45.0,25.0,'card','2026-04-21 10:50:13',40,'12:00',1,0,0,0,0,0);
INSERT INTO "bookings" VALUES (24,'2026-04-21','00:00','James Fan','0437134432',NULL,'Kelly','head-neck-shoulder',105.0,0.0,105.0,'cash','2026-04-21 10:50:57',60,'01:00',1,0,1,0,0,0);
INSERT INTO "bookings" VALUES (25,'2026-04-21','14:23','Mandy Chen','0483929292','VBV456','Jacky','lower-body',70.0,15.0,55.0,'cash','2026-04-21 10:51:49',40,'15:03',1,0,0,0,0,0);
INSERT INTO "bookings" VALUES (26,'2026-04-21','20:51','Vicky Q','0488765456',NULL,'Coco','full-body',175.0,0.0,175.0,'cash','2026-04-21 10:52:48',120,'22:51',0,0,0,1,0,0);
INSERT INTO "users" VALUES (1,'admin','$2b$10$0ztDjZgoaNRL8or2tE4TZenYP9aT1xtjdhNZT9BEluabtrXQ8aTpK','admin','2026-04-14 13:35:33');
COMMIT;
