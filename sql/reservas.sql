CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS reservas (
    cod_reserva SERIAL,
    tipo CHAR(1) NOT NULL,
    cod_recurso VARCHAR(3) NOT NULL,
    cpf CHAR(11) NOT NULL,
    data DATE NOT NULL,
    hora_ini TIME NOT NULL,
    hora_fim TIME NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'Reservado',
    dt_cad TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_cod_reserva PRIMARY KEY (cod_reserva),
    CONSTRAINT fk_reservas_usuarios FOREIGN KEY (cpf) REFERENCES usuarios(cpf) ON DELETE CASCADE,
    CONSTRAINT ck_reservas_tipo CHECK (tipo IN ('S', 'L')),
    CONSTRAINT ck_reservas_status CHECK (status IN ('Reservado', 'Ocupado', 'Bloqueado')),
    CONSTRAINT ck_reservas_horario CHECK (hora_fim > hora_ini),
    CONSTRAINT ex_reservas_conflito EXCLUDE USING gist (
        tipo WITH =,
        cod_recurso WITH =,
        tsrange(data + hora_ini, data + hora_fim) WITH &&
    )
);

CREATE INDEX IF NOT EXISTS idx_reservas_data ON reservas (data);
