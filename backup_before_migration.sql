--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'WIN1252';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: aerich; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.aerich (
    id integer NOT NULL,
    version character varying(255) NOT NULL,
    app character varying(100) NOT NULL,
    content jsonb NOT NULL
);


ALTER TABLE public.aerich OWNER TO postgres;

--
-- Name: aerich_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.aerich_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.aerich_id_seq OWNER TO postgres;

--
-- Name: aerich_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.aerich_id_seq OWNED BY public.aerich.id;


--
-- Name: animal_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.animal_history (
    id integer NOT NULL,
    field_name character varying(50) NOT NULL,
    old_value character varying(255),
    new_value character varying(255),
    changed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    changed_by character varying(50),
    animal_id integer NOT NULL
);


ALTER TABLE public.animal_history OWNER TO postgres;

--
-- Name: TABLE animal_history; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.animal_history IS 'Modelo para tracking de cambios';


--
-- Name: animal_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.animal_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.animal_history_id_seq OWNER TO postgres;

--
-- Name: animal_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.animal_history_id_seq OWNED BY public.animal_history.id;


--
-- Name: animals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.animals (
    id integer NOT NULL,
    explotacio character varying(100) NOT NULL,
    nom character varying(50) NOT NULL,
    genere character varying(1) NOT NULL,
    estado character varying(3) NOT NULL,
    alletar boolean,
    pare character varying(100),
    mare character varying(100),
    quadra character varying(100),
    cod character varying(20),
    num_serie character varying(50),
    dob date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.animals OWNER TO postgres;

--
-- Name: TABLE animals; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.animals IS 'Modelo principal de Animal basado en el Excel original';


--
-- Name: COLUMN animals.genere; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.animals.genere IS 'MASCLE: M\nFEMELLA: F';


--
-- Name: COLUMN animals.estado; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.animals.estado IS 'OK: OK\nFALLECIDO: DEF';


--
-- Name: animals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.animals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.animals_id_seq OWNER TO postgres;

--
-- Name: animals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.animals_id_seq OWNED BY public.animals.id;


--
-- Name: part; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.part (
    id integer NOT NULL,
    data date NOT NULL,
    genere_fill character varying(1),
    estat_fill character varying(3),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    animal_id integer NOT NULL
);


ALTER TABLE public.part OWNER TO postgres;

--
-- Name: COLUMN part.genere_fill; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.part.genere_fill IS 'MASCLE: M\nFEMELLA: F';


--
-- Name: COLUMN part.estat_fill; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.part.estat_fill IS 'OK: OK\nFALLECIDO: DEF';


--
-- Name: part_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.part_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.part_id_seq OWNER TO postgres;

--
-- Name: part_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.part_id_seq OWNED BY public.part.id;


--
-- Name: parts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parts (
    id integer NOT NULL,
    data date NOT NULL,
    genere_fill character varying(1) NOT NULL,
    estat_fill character varying(3) DEFAULT 'OK'::character varying NOT NULL,
    numero_part integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    animal_id integer NOT NULL
);


ALTER TABLE public.parts OWNER TO postgres;

--
-- Name: COLUMN parts.genere_fill; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.parts.genere_fill IS 'MASCLE: M\nFEMELLA: F';


--
-- Name: COLUMN parts.estat_fill; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.parts.estat_fill IS 'OK: OK\nDEF: DEF';


--
-- Name: parts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.parts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parts_id_seq OWNER TO postgres;

--
-- Name: parts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.parts_id_seq OWNED BY public.parts.id;


--
-- Name: aerich id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aerich ALTER COLUMN id SET DEFAULT nextval('public.aerich_id_seq'::regclass);


--
-- Name: animal_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_history ALTER COLUMN id SET DEFAULT nextval('public.animal_history_id_seq'::regclass);


--
-- Name: animals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animals ALTER COLUMN id SET DEFAULT nextval('public.animals_id_seq'::regclass);


--
-- Name: part id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.part ALTER COLUMN id SET DEFAULT nextval('public.part_id_seq'::regclass);


--
-- Name: parts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parts ALTER COLUMN id SET DEFAULT nextval('public.parts_id_seq'::regclass);


--
-- Data for Name: aerich; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.aerich (id, version, app, content) FROM stdin;
1	0_20250210195129_init.py	models	{"models.Parto": {"app": "models", "name": "models.Parto", "table": "partos", "indexes": [], "abstract": false, "pk_field": {"name": "id", "unique": true, "default": null, "indexed": true, "nullable": false, "db_column": "id", "docstring": null, "generated": true, "field_type": "IntField", "constraints": {"ge": 1, "le": 2147483647}, "description": null, "python_type": "int", "db_field_types": {"": "INT"}}, "docstring": null, "fk_fields": [{"name": "animal", "unique": false, "default": null, "indexed": false, "nullable": false, "docstring": null, "generated": false, "on_delete": "CASCADE", "raw_field": "animal_id", "field_type": "ForeignKeyFieldInstance", "constraints": {}, "description": null, "python_type": "models.Animal", "db_constraint": true}], "m2m_fields": [], "o2o_fields": [], "data_fields": [{"name": "fecha", "unique": false, "default": null, "indexed": false, "nullable": false, "db_column": "fecha", "docstring": null, "generated": false, "field_type": "DateField", "constraints": {}, "description": null, "python_type": "datetime.date", "db_field_types": {"": "DATE"}}, {"name": "genere_cria", "unique": false, "default": null, "indexed": false, "nullable": false, "db_column": "genere_cria", "docstring": null, "generated": false, "field_type": "CharEnumFieldInstance", "constraints": {"max_length": 1}, "description": "MASCLE: M\\nFEMELLA: F", "python_type": "str", "db_field_types": {"": "VARCHAR(1)"}}, {"name": "estado_cria", "unique": false, "default": "ACTIU", "indexed": false, "nullable": false, "db_column": "estado_cria", "docstring": null, "generated": false, "field_type": "CharEnumFieldInstance", "constraints": {"max_length": 5}, "description": "ACTIU: ACTIU\\nMORT: MORT", "python_type": "str", "db_field_types": {"": "VARCHAR(5)"}}, {"name": "numero_parto", "unique": false, "default": null, "indexed": false, "nullable": false, "db_column": "numero_parto", "docstring": null, "generated": false, "field_type": "IntField", "constraints": {"ge": -2147483648, "le": 2147483647}, "description": null, "python_type": "int", "db_field_types": {"": "INT"}}, {"name": "created_at", "unique": false, "default": null, "indexed": false, "auto_now": false, "nullable": false, "db_column": "created_at", "docstring": null, "generated": false, "field_type": "DatetimeField", "constraints": {"readOnly": true}, "description": null, "python_type": "datetime.datetime", "auto_now_add": true, "db_field_types": {"": "TIMESTAMP", "mssql": "DATETIME2", "mysql": "DATETIME(6)", "oracle": "TIMESTAMP WITH TIME ZONE", "postgres": "TIMESTAMPTZ"}}, {"name": "updated_at", "unique": false, "default": null, "indexed": false, "auto_now": true, "nullable": false, "db_column": "updated_at", "docstring": null, "generated": false, "field_type": "DatetimeField", "constraints": {"readOnly": true}, "description": null, "python_type": "datetime.datetime", "auto_now_add": true, "db_field_types": {"": "TIMESTAMP", "mssql": "DATETIME2", "mysql": "DATETIME(6)", "oracle": "TIMESTAMP WITH TIME ZONE", "postgres": "TIMESTAMPTZ"}}, {"name": "animal_id", "unique": false, "default": null, "indexed": false, "nullable": false, "db_column": "animal_id", "docstring": null, "generated": false, "field_type": "IntField", "constraints": {"ge": 1, "le": 2147483647}, "description": null, "python_type": "int", "db_field_types": {"": "INT"}}], "description": null, "unique_together": [], "backward_fk_fields": [], "backward_o2o_fields": []}, "models.Aerich": {"app": "models", "name": "models.Aerich", "table": "aerich", "indexes": [], "abstract": false, "pk_field": {"name": "id", "unique": true, "default": null, "indexed": true, "nullable": false, "db_column": "id", "docstring": null, "generated": true, "field_type": "IntField", "constraints": {"ge": 1, "le": 2147483647}, "description": null, "python_type": "int", "db_field_types": {"": "INT"}}, "docstring": null, "fk_fields": [], "m2m_fields": [], "o2o_fields": [], "data_fields": [{"name": "version", "unique": false, "default": null, "indexed": false, "nullable": false, "db_column": "version", "docstring": null, "generated": false, "field_type": "CharField", "constraints": {"max_length": 255}, "description": null, "python_type": "str", "db_field_types": {"": "VARCHAR(255)"}}, {"name": "app", "unique": false, "default": null, "indexed": false, "nullable": false, "db_column": "app", "docstring": null, "generated": false, "field_type": "CharField", "constraints": {"max_length": 100}, "description": null, "python_type": "str", "db_field_types": {"": "VARCHAR(100)"}}, {"name": "content", "unique": false, "default": null, "indexed": false, "nullable": false, "db_column": "content", "docstring": null, "generated": false, "field_type": "JSONField", "constraints": {}, "description": null, "python_type": "Union[dict, list]", "db_field_types": {"": "JSON", "mssql": "NVARCHAR(MAX)", "oracle": "NCLOB", "postgres": "JSONB"}}], "description": null, "unique_together": [], "backward_fk_fields": [], "backward_o2o_fields": []}, "models.Animal": {"app": "models", "name": "models.Animal", "table": "animals", "indexes": [], "abstract": false, "pk_field": {"name": "id", "unique": true, "default": null, "indexed": true, "nullable": false, "db_column": "id", "docstring": null, "generated": true, "field_type": "IntField", "constraints": {"ge": 1, "le": 2147483647}, "description": null, "python_type": "int", "db_field_types": {"": "INT"}}, "docstring": null, "fk_fields": [], "m2m_fields": [], "o2o_fields": [], "data_fields": [{"name": "nom", "unique": true, "default": null, "indexed": true, "nullable": false, "db_column": "nom", "docstring": null, "generated": false, "field_type": "CharField", "constraints": {"max_length": 100}, "description": null, "python_type": "str", "db_field_types": {"": "VARCHAR(100)"}}, {"name": "cod", "unique": true, "default": null, "indexed": true, "nullable": true, "db_column": "cod", "docstring": null, "generated": false, "field_type": "CharField", "constraints": {"max_length": 50}, "description": null, "python_type": "str", "db_field_types": {"": "VARCHAR(50)"}}, {"name": "num_serie", "unique": true, "default": null, "indexed": true, "nullable": true, "db_column": "num_serie", "docstring": null, "generated": false, "field_type": "CharField", "constraints": {"max_length": 50}, "description": null, "python_type": "str", "db_field_types": {"": "VARCHAR(50)"}}, {"name": "alletar", "unique": false, "default": false, "indexed": false, "nullable": false, "db_column": "alletar", "docstring": null, "generated": false, "field_type": "BooleanField", "constraints": {}, "description": null, "python_type": "bool", "db_field_types": {"": "BOOL", "mssql": "BIT", "oracle": "NUMBER(1)", "sqlite": "INT"}}, {"name": "estado", "unique": false, "default": "ACTIU", "indexed": false, "nullable": false, "db_column": "estado", "docstring": null, "generated": false, "field_type": "CharEnumFieldInstance", "constraints": {"max_length": 5}, "description": "ACTIU: ACTIU\\nMORT: MORT", "python_type": "str", "db_field_types": {"": "VARCHAR(5)"}}, {"name": "genere", "unique": false, "default": null, "indexed": false, "nullable": false, "db_column": "genere", "docstring": null, "generated": false, "field_type": "CharEnumFieldInstance", "constraints": {"max_length": 1}, "description": "MASCLE: M\\nFEMELLA: F", "python_type": "str", "db_field_types": {"": "VARCHAR(1)"}}, {"name": "created_at", "unique": false, "default": null, "indexed": false, "auto_now": false, "nullable": false, "db_column": "created_at", "docstring": null, "generated": false, "field_type": "DatetimeField", "constraints": {"readOnly": true}, "description": null, "python_type": "datetime.datetime", "auto_now_add": true, "db_field_types": {"": "TIMESTAMP", "mssql": "DATETIME2", "mysql": "DATETIME(6)", "oracle": "TIMESTAMP WITH TIME ZONE", "postgres": "TIMESTAMPTZ"}}, {"name": "updated_at", "unique": false, "default": null, "indexed": false, "auto_now": true, "nullable": false, "db_column": "updated_at", "docstring": null, "generated": false, "field_type": "DatetimeField", "constraints": {"readOnly": true}, "description": null, "python_type": "datetime.datetime", "auto_now_add": true, "db_field_types": {"": "TIMESTAMP", "mssql": "DATETIME2", "mysql": "DATETIME(6)", "oracle": "TIMESTAMP WITH TIME ZONE", "postgres": "TIMESTAMPTZ"}}], "description": null, "unique_together": [], "backward_fk_fields": [{"name": "partos", "unique": false, "default": null, "indexed": false, "nullable": false, "docstring": null, "generated": false, "field_type": "BackwardFKRelation", "constraints": {}, "description": null, "python_type": "models.Parto", "db_constraint": true}], "backward_o2o_fields": []}}
\.


--
-- Data for Name: animal_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.animal_history (id, field_name, old_value, new_value, changed_at, changed_by, animal_id) FROM stdin;
\.


--
-- Data for Name: animals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.animals (id, explotacio, nom, genere, estado, alletar, pare, mare, quadra, cod, num_serie, dob, created_at, updated_at) FROM stdin;
33	Gaudalajara	Emma	F	OK	f	Constantino	Pilar	Gallegos	5265	es456321	1950-11-29	2025-02-16 19:04:41.667317+01	2025-02-16 22:32:03.558223+01
1	Gurans	1	M	OK	f	\N	\N	Riera	7892	ES07090513	2020-01-31	2025-02-16 19:04:41.62075+01	2025-02-16 22:32:03.501222+01
34	Madrid	Nico	M	OK	f	Javi	Esther	Dorado	5345	es12341351	1981-01-23	2025-02-16 19:04:41.668317+01	2025-02-16 22:32:03.559224+01
2	Gurans	20-36	F	OK	f	Xero	11-03	\N	6350	ES02090513	2020-03-02	2025-02-16 19:04:41.623751+01	2025-02-16 22:32:03.504224+01
3	Gurans	20-50	F	OK	f	Xero	83	\N	8461	ES04090513	2020-01-24	2025-02-16 19:04:41.625256+01	2025-02-16 22:32:03.509223+01
4	Gurans	20-51	F	OK	f	Xero	236	\N	5039	ES02090513	2020-06-29	2025-02-16 19:04:41.626863+01	2025-02-16 22:32:03.514223+01
5	Gurans	20-64	F	OK	f	Xero	K-12	\N	7039	ES00090537	2020-10-28	2025-02-16 19:04:41.627857+01	2025-02-16 22:32:03.517223+01
35	Madrid	Clara	F	OK	f	Alfonso	Emma	Martinez	5425	es463573457	1981-07-28	2025-02-16 19:04:41.669317+01	2025-02-16 22:32:03.560223+01
6	Gurans	R-32	F	OK	f	\N	\N	\N	6144	\N	2018-02-17	2025-02-16 19:04:41.628857+01	2025-02-16 22:32:03.520223+01
36	Guadalajara	Marcos	M	OK	f	PAblo	MArta	Martinez de Andres	5505	es7798465123312	2010-01-08	2025-02-16 19:04:41.670317+01	2025-02-16 22:32:03.561223+01
37	Guadalajara	Elena	F	OK	f	Pablo	Marta	Martienz de andres	5585	es124148134598	2012-02-18	2025-02-16 19:04:41.671317+01	2025-02-16 22:32:03.562223+01
7	Gurans	E6	F	OK	f	\N	\N	\N	\N	\N	2018-02-18	2025-02-16 19:04:41.630857+01	2025-02-16 22:32:03.531223+01
8	Gurans	G-16	F	OK	f	\N	\N	\N	\N	\N	2018-02-19	2025-02-16 19:04:41.631861+01	2025-02-16 22:32:03.532223+01
9	Gurans	K-75	F	OK	f	\N	\N	\N	\N	\N	2018-02-20	2025-02-16 19:04:41.633857+01	2025-02-16 22:32:03.533224+01
10	Gurans	I-2	F	OK	f	\N	\N	\N	\N	\N	2018-02-21	2025-02-16 19:04:41.633857+01	2025-02-16 22:32:03.534224+01
11	Gurans	H-71	F	OK	f	\N	\N	\N	\N	\N	2018-02-22	2025-02-16 19:04:41.636364+01	2025-02-16 22:32:03.535223+01
12	Gurans	46	F	OK	f	\N	\N	\N	\N	\N	2018-02-23	2025-02-16 19:04:41.637369+01	2025-02-16 22:32:03.536223+01
13	Gurans	51	F	OK	f	\N	\N	\N	\N	\N	2018-02-24	2025-02-16 19:04:41.639368+01	2025-02-16 22:32:03.537223+01
14	Gurans	K-41	F	OK	f	\N	\N	\N	\N	\N	2018-02-25	2025-02-16 19:04:41.641369+01	2025-02-16 22:32:03.538223+01
15	Gurans	47	F	OK	f	\N	\N	\N	\N	\N	2018-02-26	2025-02-16 19:04:41.642369+01	2025-02-16 22:32:03.539223+01
16	Gurans	21-17	F	OK	f	\N	\N	\N	\N	\N	2018-02-27	2025-02-16 19:04:41.643368+01	2025-02-16 22:32:03.540223+01
17	Gurans	21-19	F	OK	f	\N	\N	\N	\N	\N	2018-02-28	2025-02-16 19:04:41.645368+01	2025-02-16 22:32:03.541223+01
18	Gurans	21-09	F	OK	f	\N	\N	\N	\N	\N	2018-03-01	2025-02-16 19:04:41.646877+01	2025-02-16 22:32:03.542223+01
19	Gurans	21-31	F	OK	f	\N	\N	\N	\N	\N	2018-03-02	2025-02-16 19:04:41.648876+01	2025-02-16 22:32:03.543223+01
20	Gurans	21-28	F	OK	f	\N	\N	\N	\N	\N	2018-03-03	2025-02-16 19:04:41.649876+01	2025-02-16 22:32:03.544223+01
21	Gurans	21-29	F	OK	f	\N	\N	\N	\N	\N	2018-03-04	2025-02-16 19:04:41.651875+01	2025-02-16 22:32:03.545224+01
22	Gurans	23-09	F	OK	f	\N	\N	\N	\N	\N	2018-03-05	2025-02-16 19:04:41.652876+01	2025-02-16 22:32:03.546223+01
23	Gurans	23-04	F	OK	f	\N	\N	\N	\N	\N	\N	2025-02-16 19:04:41.653373+01	2025-02-16 22:32:03.547223+01
24	Gurans	50	F	OK	t	\N	\N	\N	\N	\N	\N	2025-02-16 19:04:41.655378+01	2025-02-16 22:32:03.548223+01
25	Gurans	52	F	OK	t	\N	\N	\N	\N	\N	\N	2025-02-16 19:04:41.656479+01	2025-02-16 22:32:03.549222+01
26	Gurans	E5	F	OK	t	\N	\N	\N	\N	\N	\N	2025-02-16 19:04:41.658552+01	2025-02-16 22:32:03.549222+01
38	Guadalajara	Afri	F	OK	f	Pere	Maria Luisa	Pereira	5665	es794133	1977-06-15	2025-02-16 19:04:41.673318+01	2025-02-16 22:32:03.563223+01
39	Guadalajara	Lola	F	OK	f	Gonzalo	Africa	Ruiz pereira	5745	es213498243785298	2008-06-14	2025-02-16 19:04:41.674317+01	2025-02-16 22:32:03.564223+01
40	Guadalajara	paBLIS	M	OK	f	aLFON	ELMA	MARTINES	6145	ES35838294	2025-10-12	2025-02-16 19:04:41.675317+01	2025-02-16 22:32:03.564223+01
41	asdafasf	asdasd	F	OK	f	asd	asd	asd	6225	ES35838220	\N	2025-02-16 19:04:41.676392+01	2025-02-16 22:32:03.565224+01
27	Gurans	E8	F	OK	t	\N	\N	\N	\N	\N	\N	2025-02-16 19:04:41.658766+01	2025-02-16 22:32:03.550222+01
42	asdasf	fdsdf	F	OK	f	asdad	asdasd	asdasd	6465	12312314124	\N	2025-02-16 19:04:41.676924+01	2025-02-16 22:32:03.566223+01
28	Gurans	K-73	F	OK	t	\N	\N	\N	\N	\N	\N	2025-02-16 19:04:41.66081+01	2025-02-16 22:32:03.551222+01
43	asdasd	asfasdf	F	OK	f	asd	asd	asdfafaf	6545	asdafasf	\N	2025-02-16 19:04:41.677971+01	2025-02-16 22:32:03.567222+01
29	Guadalajara	Pablo	M	DEF	f	alfonso	Emma	Martinez	4785	es1123456987	1977-03-09	2025-02-16 19:04:41.66181+01	2025-02-16 22:32:03.552223+01
30	Prueba 2	Mario	M	OK	f	Mario	Elisa	Martinez	4865	Es1452365489662	1976-08-14	2025-02-16 19:04:41.66281+01	2025-02-16 22:32:03.553222+01
31	Guadalajara	Marta	F	OK	f	Jose ignacio	Elena	de Andres	4945	Es4587963211456	1977-06-30	2025-02-16 19:04:41.66381+01	2025-02-16 22:32:03.554222+01
32	Guadalajara	Felipe	M	OK	f	Alfredo	marialuis	VIejo	5185	es123654789	1978-05-01	2025-02-16 19:04:41.665313+01	2025-02-16 22:32:03.557223+01
\.


--
-- Data for Name: part; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.part (id, data, genere_fill, estat_fill, created_at, animal_id) FROM stdin;
\.


--
-- Data for Name: parts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parts (id, data, genere_fill, estat_fill, numero_part, created_at, updated_at, animal_id) FROM stdin;
1	2022-12-19	F	DEF	1	2025-02-16 22:32:03.506224+01	2025-02-16 22:32:03.506224+01	2
2	2023-11-17	M	OK	2	2025-02-16 22:32:03.508223+01	2025-02-16 22:32:03.508223+01	2
3	2023-02-28	F	OK	1	2025-02-16 22:32:03.511223+01	2025-02-16 22:32:03.511223+01	3
4	2024-02-23	M	OK	2	2025-02-16 22:32:03.512223+01	2025-02-16 22:32:03.512223+01	3
5	2023-05-13	F	OK	1	2025-02-16 22:32:03.515223+01	2025-02-16 22:32:03.515223+01	4
6	2024-05-02	F	OK	2	2025-02-16 22:32:03.516223+01	2025-02-16 22:32:03.516223+01	4
7	2023-04-27	M	OK	1	2025-02-16 22:32:03.518223+01	2025-02-16 22:32:03.518223+01	5
8	2024-06-12	M	OK	2	2025-02-16 22:32:03.519223+01	2025-02-16 22:32:03.519223+01	5
9	2019-11-28	F	OK	1	2025-02-16 22:32:03.521223+01	2025-02-16 22:32:03.521223+01	6
10	2021-02-05	F	OK	2	2025-02-16 22:32:03.522224+01	2025-02-16 22:32:03.522224+01	6
11	2022-02-28	F	OK	3	2025-02-16 22:32:03.523222+01	2025-02-16 22:32:03.523222+01	6
12	2023-02-10	M	OK	4	2025-02-16 22:32:03.524222+01	2025-02-16 22:32:03.524222+01	6
13	2024-02-06	F	OK	5	2025-02-16 22:32:03.526223+01	2025-02-16 22:32:03.526223+01	6
14	2012-02-18	F	OK	1	2025-02-16 22:32:03.555222+01	2025-02-16 22:32:03.555222+01	31
15	2010-01-08	M	OK	2	2025-02-16 22:32:03.556223+01	2025-02-16 22:32:03.556223+01	31
\.


--
-- Name: aerich_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.aerich_id_seq', 1, true);


--
-- Name: animal_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.animal_history_id_seq', 1, false);


--
-- Name: animals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.animals_id_seq', 43, true);


--
-- Name: part_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.part_id_seq', 1, false);


--
-- Name: parts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.parts_id_seq', 15, true);


--
-- Name: aerich aerich_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aerich
    ADD CONSTRAINT aerich_pkey PRIMARY KEY (id);


--
-- Name: animal_history animal_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_history
    ADD CONSTRAINT animal_history_pkey PRIMARY KEY (id);


--
-- Name: animals animals_cod_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_cod_key UNIQUE (cod);


--
-- Name: animals animals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_pkey PRIMARY KEY (id);


--
-- Name: part part_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.part
    ADD CONSTRAINT part_pkey PRIMARY KEY (id);


--
-- Name: parts parts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parts
    ADD CONSTRAINT parts_pkey PRIMARY KEY (id);


--
-- Name: animal_history animal_history_animal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_history
    ADD CONSTRAINT animal_history_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES public.animals(id) ON DELETE CASCADE;


--
-- Name: parts parts_animal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parts
    ADD CONSTRAINT parts_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES public.animals(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO masclet_user;


--
-- Name: TABLE aerich; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.aerich TO masclet_user;


--
-- Name: SEQUENCE aerich_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.aerich_id_seq TO masclet_user;


--
-- Name: TABLE animal_history; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.animal_history TO masclet_user;


--
-- Name: TABLE animals; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.animals TO masclet_user;


--
-- Name: TABLE part; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.part TO masclet_user;


--
-- Name: TABLE parts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.parts TO masclet_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO masclet_user;


--
-- PostgreSQL database dump complete
--

