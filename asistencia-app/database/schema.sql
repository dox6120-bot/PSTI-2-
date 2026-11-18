CREATE DATABASE IF NOT EXISTS asistencia_uejmbp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE asistencia_uejmbp;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cedula VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('administrador','personal') NOT NULL DEFAULT 'personal',
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  año VARCHAR(20) NOT NULL,
  seccion VARCHAR(10) NOT NULL,
  docente_id INT,
  FOREIGN KEY (docente_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE estudiantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cedula VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  fecha_nacimiento DATE,
  representante VARCHAR(150),
  telefono VARCHAR(30),
  curso_id INT,
  activo TINYINT(1) DEFAULT 1,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE SET NULL
);

CREATE TABLE asistencias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id INT NOT NULL,
  fecha DATE NOT NULL,
  estado ENUM('presente','ausente','tardanza','justificado') NOT NULL,
  observacion TEXT,
  registrado_por INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_asistencia (estudiante_id, fecha),
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
  FOREIGN KEY (registrado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);