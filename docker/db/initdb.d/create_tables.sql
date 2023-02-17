CREATE TABLE address_master (
  type VARCHAR(16) NOT NULL,
  UNIQUE (type)
) DEFAULT CHARSET=utf8mb4;


CREATE TABLE photos_master (
  type VARCHAR(16) NOT NULL,
  UNIQUE (type)
) DEFAULT CHARSET=utf8mb4;


CREATE TABLE cards_master (
  serial_number VARCHAR(44)   PRIMARY KEY,
  prefectures   VARCHAR(16)   NOT NULL,
  city          VARCHAR(60)   NOT NULL,
  version       VARCHAR(20)   NOT NULL,
  issue_date    DATE          NOT NULL,
  comment       VARCHAR(255),
  stock_link    VARCHAR(255),
  FOREIGN KEY (prefectures) REFERENCES address_master(type)
) DEFAULT CHARSET=utf8mb4;


CREATE TABLE cards_master_detail (
  id                          INT           PRIMARY KEY AUTO_INCREMENT,
  distribute_location         VARCHAR(255)  NOT NULL,
  location_link               VARCHAR(255),
  distribute_address          VARCHAR(255),
  cards_master_serial_number  VARCHAR(44)   NOT NULL,
  FOREIGN KEY (cards_master_serial_number) REFERENCES cards_master(serial_number)
) DEFAULT CHARSET=utf8mb4;


CREATE TABLE users (
  id                INT           PRIMARY KEY AUTO_INCREMENT,
  firebase_auth_uid VARCHAR(255)  UNIQUE NOT NULL,
  name              VARCHAR(40)   NOT NULL,
  address           VARCHAR(16),
  birthday          DATE,
  created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (address) REFERENCES address_master(type)
) DEFAULT CHARSET=utf8mb4;


CREATE TABLE cards (
  id                          INT           PRIMARY KEY AUTO_INCREMENT,
  firebase_auth_uid           VARCHAR(255)  NOT NULL,
  collect_date                DATE          NOT NULL,
  cards_master_serial_number  VARCHAR(50)   NOT NULL,
  created_at                  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at                  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cards_master_serial_number) REFERENCES cards_master(serial_number),
  FOREIGN KEY (firebase_auth_uid) REFERENCES users(firebase_auth_uid),
  UNIQUE(firebase_auth_uid, cards_master_serial_number)
) DEFAULT CHARSET=utf8mb4;


CREATE TABLE photos (
  id                INT           PRIMARY KEY AUTO_INCREMENT,
  firebase_auth_uid VARCHAR(255)  NOT NULL,
  file_pass         VARCHAR(255)  NOT NULL,
  file_name         VARCHAR(255)  NOT NULL,
  cards_id          INT           NOT NULL,
  type              VARCHAR(16)   NOT NULL,
  created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cards_id) REFERENCES cards(id),
  FOREIGN KEY (type) REFERENCES photos_master(type)
) DEFAULT CHARSET=utf8mb4;