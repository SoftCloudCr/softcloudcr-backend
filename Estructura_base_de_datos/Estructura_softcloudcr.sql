--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-04-03 08:21:48

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 257 (class 1259 OID 18140)
-- Name: bitacora; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bitacora (
    id_log integer NOT NULL,
    id_usuario integer NOT NULL,
    id_empresa integer NOT NULL,
    accion text NOT NULL,
    detalle text,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.bitacora OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 18139)
-- Name: bitacora_id_log_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bitacora_id_log_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bitacora_id_log_seq OWNER TO postgres;

--
-- TOC entry 5329 (class 0 OID 0)
-- Dependencies: 256
-- Name: bitacora_id_log_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bitacora_id_log_seq OWNED BY public.bitacora.id_log;


--
-- TOC entry 283 (class 1259 OID 18502)
-- Name: capacitacion_departamento_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.capacitacion_departamento_usuario (
    id integer NOT NULL,
    id_empresa integer NOT NULL,
    id_capacitacion integer NOT NULL,
    id_departamento integer NOT NULL,
    id_usuario integer NOT NULL,
    fecha_asignacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.capacitacion_departamento_usuario OWNER TO postgres;

--
-- TOC entry 282 (class 1259 OID 18501)
-- Name: capacitacion_departamento_usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.capacitacion_departamento_usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.capacitacion_departamento_usuario_id_seq OWNER TO postgres;

--
-- TOC entry 5330 (class 0 OID 0)
-- Dependencies: 282
-- Name: capacitacion_departamento_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.capacitacion_departamento_usuario_id_seq OWNED BY public.capacitacion_departamento_usuario.id;


--
-- TOC entry 269 (class 1259 OID 18259)
-- Name: capacitaciones_activas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.capacitaciones_activas (
    id_capacitacion integer NOT NULL,
    id_empresa integer NOT NULL,
    nombre character varying NOT NULL,
    objetivo_estrategico character varying,
    requiere_pdf boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_inicio date NOT NULL,
    fecha_limite date NOT NULL,
    estado character varying DEFAULT 'activa'::character varying,
    borrador boolean DEFAULT true,
    fecha_activacion timestamp without time zone,
    nota_minima numeric
);


ALTER TABLE public.capacitaciones_activas OWNER TO postgres;

--
-- TOC entry 295 (class 1259 OID 18684)
-- Name: capacitaciones_activas_archivos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.capacitaciones_activas_archivos (
    id_archivo integer NOT NULL,
    id_capacitacion integer NOT NULL,
    id_empresa integer NOT NULL,
    url_archivo text NOT NULL,
    nombre_original text,
    fecha_subida timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.capacitaciones_activas_archivos OWNER TO postgres;

--
-- TOC entry 294 (class 1259 OID 18683)
-- Name: capacitaciones_activas_archivos_id_archivo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.capacitaciones_activas_archivos_id_archivo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.capacitaciones_activas_archivos_id_archivo_seq OWNER TO postgres;

--
-- TOC entry 5331 (class 0 OID 0)
-- Dependencies: 294
-- Name: capacitaciones_activas_archivos_id_archivo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.capacitaciones_activas_archivos_id_archivo_seq OWNED BY public.capacitaciones_activas_archivos.id_archivo;


--
-- TOC entry 268 (class 1259 OID 18258)
-- Name: capacitaciones_activas_id_capacitacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.capacitaciones_activas_id_capacitacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.capacitaciones_activas_id_capacitacion_seq OWNER TO postgres;

--
-- TOC entry 5332 (class 0 OID 0)
-- Dependencies: 268
-- Name: capacitaciones_activas_id_capacitacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.capacitaciones_activas_id_capacitacion_seq OWNED BY public.capacitaciones_activas.id_capacitacion;


--
-- TOC entry 281 (class 1259 OID 18474)
-- Name: certificados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certificados (
    id_certificado integer NOT NULL,
    id_empresa integer NOT NULL,
    id_usuario integer NOT NULL,
    id_asignacion integer NOT NULL,
    url_certificado character varying,
    fecha_certificacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    emitido_por character varying,
    estado character varying DEFAULT 'emitido'::character varying
);


ALTER TABLE public.certificados OWNER TO postgres;

--
-- TOC entry 280 (class 1259 OID 18473)
-- Name: certificados_id_certificado_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.certificados_id_certificado_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.certificados_id_certificado_seq OWNER TO postgres;

--
-- TOC entry 5333 (class 0 OID 0)
-- Dependencies: 280
-- Name: certificados_id_certificado_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.certificados_id_certificado_seq OWNED BY public.certificados.id_certificado;


--
-- TOC entry 263 (class 1259 OID 18197)
-- Name: consumo_creditos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumo_creditos (
    id_consumo integer NOT NULL,
    id_empresa integer NOT NULL,
    tipo_recurso character varying(20) NOT NULL,
    cantidad_creditos integer NOT NULL,
    descripcion text,
    fecha_consumo timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.consumo_creditos OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 18196)
-- Name: consumo_creditos_id_consumo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.consumo_creditos_id_consumo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consumo_creditos_id_consumo_seq OWNER TO postgres;

--
-- TOC entry 5334 (class 0 OID 0)
-- Dependencies: 262
-- Name: consumo_creditos_id_consumo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consumo_creditos_id_consumo_seq OWNED BY public.consumo_creditos.id_consumo;


--
-- TOC entry 234 (class 1259 OID 17737)
-- Name: cuestionarios_catalogo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuestionarios_catalogo (
    id_cuestionario integer NOT NULL,
    id_empresa integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion character varying(250),
    intentos_permitidos integer DEFAULT 1 NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    estado boolean DEFAULT true,
    borrador boolean DEFAULT true
);


ALTER TABLE public.cuestionarios_catalogo OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 17736)
-- Name: cuestionarios_catalogo_id_cuestionario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cuestionarios_catalogo_id_cuestionario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cuestionarios_catalogo_id_cuestionario_seq OWNER TO postgres;

--
-- TOC entry 5335 (class 0 OID 0)
-- Dependencies: 233
-- Name: cuestionarios_catalogo_id_cuestionario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cuestionarios_catalogo_id_cuestionario_seq OWNED BY public.cuestionarios_catalogo.id_cuestionario;


--
-- TOC entry 273 (class 1259 OID 18303)
-- Name: cuestionarios_usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuestionarios_usuarios (
    id_cuestionario_usuario integer NOT NULL,
    id_capacitacion integer NOT NULL,
    id_empresa integer NOT NULL,
    intentos_permitidos integer NOT NULL,
    nombre character varying NOT NULL,
    descripcion text,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estado boolean DEFAULT true
);


ALTER TABLE public.cuestionarios_usuarios OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 18302)
-- Name: cuestionarios_usuarios_id_cuestionario_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cuestionarios_usuarios_id_cuestionario_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cuestionarios_usuarios_id_cuestionario_usuario_seq OWNER TO postgres;

--
-- TOC entry 5336 (class 0 OID 0)
-- Dependencies: 272
-- Name: cuestionarios_usuarios_id_cuestionario_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cuestionarios_usuarios_id_cuestionario_usuario_seq OWNED BY public.cuestionarios_usuarios.id_cuestionario_usuario;


--
-- TOC entry 226 (class 1259 OID 17626)
-- Name: departamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departamentos (
    id_departamento integer NOT NULL,
    id_empresa integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    estado boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.departamentos OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 17625)
-- Name: departamentos_id_departamento_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departamentos_id_departamento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departamentos_id_departamento_seq OWNER TO postgres;

--
-- TOC entry 5337 (class 0 OID 0)
-- Dependencies: 225
-- Name: departamentos_id_departamento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departamentos_id_departamento_seq OWNED BY public.departamentos.id_departamento;


--
-- TOC entry 218 (class 1259 OID 17527)
-- Name: empresas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empresas (
    id_empresa integer NOT NULL,
    nombre character varying(100) NOT NULL,
    estado character varying(20) DEFAULT 'Activo'::character varying NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    slug_empresa character varying(50) NOT NULL
);


ALTER TABLE public.empresas OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 17526)
-- Name: empresas_id_empresa_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.empresas_id_empresa_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.empresas_id_empresa_seq OWNER TO postgres;

--
-- TOC entry 5338 (class 0 OID 0)
-- Dependencies: 217
-- Name: empresas_id_empresa_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.empresas_id_empresa_seq OWNED BY public.empresas.id_empresa;


--
-- TOC entry 291 (class 1259 OID 18635)
-- Name: errores_intentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.errores_intentos (
    id_error integer NOT NULL,
    id_empresa integer,
    id_usuario integer,
    id_asignacion integer,
    mensaje_error text NOT NULL,
    contexto jsonb,
    severidad character varying(20) DEFAULT 'warning'::character varying,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.errores_intentos OWNER TO postgres;

--
-- TOC entry 290 (class 1259 OID 18634)
-- Name: errores_intentos_id_error_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.errores_intentos_id_error_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.errores_intentos_id_error_seq OWNER TO postgres;

--
-- TOC entry 5339 (class 0 OID 0)
-- Dependencies: 290
-- Name: errores_intentos_id_error_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.errores_intentos_id_error_seq OWNED BY public.errores_intentos.id_error;


--
-- TOC entry 279 (class 1259 OID 18443)
-- Name: gamificacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gamificacion (
    id_gamificacion integer NOT NULL,
    id_empresa integer NOT NULL,
    id_usuario integer NOT NULL,
    id_asignacion integer NOT NULL,
    id_cuestionario_usuario integer NOT NULL,
    puntos_obtenidos integer DEFAULT 0 NOT NULL,
    evento text,
    fecha_obtencion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.gamificacion OWNER TO postgres;

--
-- TOC entry 278 (class 1259 OID 18442)
-- Name: gamificacion_id_gamificacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gamificacion_id_gamificacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gamificacion_id_gamificacion_seq OWNER TO postgres;

--
-- TOC entry 5340 (class 0 OID 0)
-- Dependencies: 278
-- Name: gamificacion_id_gamificacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gamificacion_id_gamificacion_seq OWNED BY public.gamificacion.id_gamificacion;


--
-- TOC entry 289 (class 1259 OID 18615)
-- Name: historial_interacciones_capacitacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historial_interacciones_capacitacion (
    id_historial integer NOT NULL,
    id_asignacion integer NOT NULL,
    id_empresa integer NOT NULL,
    id_usuario integer NOT NULL,
    tipo_evento character varying(100),
    campo_modificado text,
    valor_anterior text,
    valor_nuevo text,
    origen character varying(50),
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.historial_interacciones_capacitacion OWNER TO postgres;

--
-- TOC entry 288 (class 1259 OID 18614)
-- Name: historial_interacciones_capacitacion_id_historial_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historial_interacciones_capacitacion_id_historial_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historial_interacciones_capacitacion_id_historial_seq OWNER TO postgres;

--
-- TOC entry 5341 (class 0 OID 0)
-- Dependencies: 288
-- Name: historial_interacciones_capacitacion_id_historial_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historial_interacciones_capacitacion_id_historial_seq OWNED BY public.historial_interacciones_capacitacion.id_historial;


--
-- TOC entry 250 (class 1259 OID 18038)
-- Name: insignias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.insignias (
    id_insignia integer NOT NULL,
    nombre character varying(50) NOT NULL,
    descripcion character varying(250),
    puntos_necesarios integer NOT NULL,
    id_empresa integer
);


ALTER TABLE public.insignias OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 18037)
-- Name: insignias_id_insignia_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.insignias_id_insignia_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.insignias_id_insignia_seq OWNER TO postgres;

--
-- TOC entry 5342 (class 0 OID 0)
-- Dependencies: 249
-- Name: insignias_id_insignia_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.insignias_id_insignia_seq OWNED BY public.insignias.id_insignia;


--
-- TOC entry 252 (class 1259 OID 18050)
-- Name: insignias_usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.insignias_usuarios (
    id integer NOT NULL,
    id_insignia integer NOT NULL,
    id_usuario integer NOT NULL,
    id_empresa integer NOT NULL,
    fecha_obtencion timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.insignias_usuarios OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 18049)
-- Name: insignias_usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.insignias_usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.insignias_usuarios_id_seq OWNER TO postgres;

--
-- TOC entry 5343 (class 0 OID 0)
-- Dependencies: 251
-- Name: insignias_usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.insignias_usuarios_id_seq OWNED BY public.insignias_usuarios.id;


--
-- TOC entry 285 (class 1259 OID 18555)
-- Name: intentos_cuestionario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.intentos_cuestionario (
    id_intento integer NOT NULL,
    id_asignacion integer NOT NULL,
    id_empresa integer NOT NULL,
    id_cuestionario_usuario integer NOT NULL,
    fecha_intento timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    respuestas jsonb NOT NULL,
    nota numeric NOT NULL,
    aprobado boolean NOT NULL,
    duracion_segundos integer,
    user_agent text
);


ALTER TABLE public.intentos_cuestionario OWNER TO postgres;

--
-- TOC entry 284 (class 1259 OID 18554)
-- Name: intentos_cuestionario_id_intento_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.intentos_cuestionario_id_intento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.intentos_cuestionario_id_intento_seq OWNER TO postgres;

--
-- TOC entry 5344 (class 0 OID 0)
-- Dependencies: 284
-- Name: intentos_cuestionario_id_intento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.intentos_cuestionario_id_intento_seq OWNED BY public.intentos_cuestionario.id_intento;


--
-- TOC entry 261 (class 1259 OID 18170)
-- Name: licencias_empresas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.licencias_empresas (
    id_licencia integer NOT NULL,
    id_empresa integer NOT NULL,
    tipo_plan character varying(50) NOT NULL,
    max_usuarios integer,
    fecha_inicio timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_fin timestamp without time zone,
    estado boolean DEFAULT true
);


ALTER TABLE public.licencias_empresas OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 18169)
-- Name: licencias_empresas_id_licencia_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.licencias_empresas_id_licencia_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.licencias_empresas_id_licencia_seq OWNER TO postgres;

--
-- TOC entry 5345 (class 0 OID 0)
-- Dependencies: 260
-- Name: licencias_empresas_id_licencia_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.licencias_empresas_id_licencia_seq OWNED BY public.licencias_empresas.id_licencia;


--
-- TOC entry 259 (class 1259 OID 18150)
-- Name: log_errores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.log_errores (
    id_error integer NOT NULL,
    nivel character varying(20) NOT NULL,
    mensaje text NOT NULL,
    funcion text,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.log_errores OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 18149)
-- Name: log_errores_id_error_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.log_errores_id_error_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.log_errores_id_error_seq OWNER TO postgres;

--
-- TOC entry 5346 (class 0 OID 0)
-- Dependencies: 258
-- Name: log_errores_id_error_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.log_errores_id_error_seq OWNED BY public.log_errores.id_error;


--
-- TOC entry 248 (class 1259 OID 17869)
-- Name: metricas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.metricas (
    id_metrica integer NOT NULL,
    id_empresa integer NOT NULL,
    nombre_metrica character varying(100) NOT NULL,
    valor numeric(10,2),
    fecha_calculo timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.metricas OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 17868)
-- Name: metricas_id_metrica_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.metricas_id_metrica_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.metricas_id_metrica_seq OWNER TO postgres;

--
-- TOC entry 5347 (class 0 OID 0)
-- Dependencies: 247
-- Name: metricas_id_metrica_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.metricas_id_metrica_seq OWNED BY public.metricas.id_metrica;


--
-- TOC entry 246 (class 1259 OID 17848)
-- Name: notificaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notificaciones (
    id_notificacion integer NOT NULL,
    id_usuario integer,
    id_empresa integer NOT NULL,
    tipo character varying(50) NOT NULL,
    mensaje character varying(500) NOT NULL,
    fecha_envio timestamp without time zone DEFAULT now() NOT NULL,
    leido boolean DEFAULT false NOT NULL
);


ALTER TABLE public.notificaciones OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 17847)
-- Name: notificaciones_id_notificacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notificaciones_id_notificacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notificaciones_id_notificacion_seq OWNER TO postgres;

--
-- TOC entry 5348 (class 0 OID 0)
-- Dependencies: 245
-- Name: notificaciones_id_notificacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notificaciones_id_notificacion_seq OWNED BY public.notificaciones.id_notificacion;


--
-- TOC entry 238 (class 1259 OID 17770)
-- Name: opciones_catalogo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.opciones_catalogo (
    id_opcion integer NOT NULL,
    id_pregunta integer NOT NULL,
    id_empresa integer NOT NULL,
    texto character varying(500) NOT NULL,
    es_correcta boolean DEFAULT false NOT NULL,
    estado boolean DEFAULT true
);


ALTER TABLE public.opciones_catalogo OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 17769)
-- Name: opciones_catalogo_id_opcion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.opciones_catalogo_id_opcion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.opciones_catalogo_id_opcion_seq OWNER TO postgres;

--
-- TOC entry 5349 (class 0 OID 0)
-- Dependencies: 237
-- Name: opciones_catalogo_id_opcion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.opciones_catalogo_id_opcion_seq OWNED BY public.opciones_catalogo.id_opcion;


--
-- TOC entry 277 (class 1259 OID 18344)
-- Name: opciones_usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.opciones_usuarios (
    id_opcion_usuario integer NOT NULL,
    id_pregunta_usuario integer NOT NULL,
    id_empresa integer NOT NULL,
    texto character varying NOT NULL,
    es_correcta boolean DEFAULT false,
    estado boolean DEFAULT true
);


ALTER TABLE public.opciones_usuarios OWNER TO postgres;

--
-- TOC entry 276 (class 1259 OID 18343)
-- Name: opciones_usuarios_id_opcion_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.opciones_usuarios_id_opcion_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.opciones_usuarios_id_opcion_usuario_seq OWNER TO postgres;

--
-- TOC entry 5350 (class 0 OID 0)
-- Dependencies: 276
-- Name: opciones_usuarios_id_opcion_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.opciones_usuarios_id_opcion_usuario_seq OWNED BY public.opciones_usuarios.id_opcion_usuario;


--
-- TOC entry 232 (class 1259 OID 17725)
-- Name: permisos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permisos (
    id_permiso integer NOT NULL,
    id_rol integer NOT NULL,
    modulo character varying(50) NOT NULL,
    accion character varying(50) NOT NULL
);


ALTER TABLE public.permisos OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 17724)
-- Name: permisos_id_permiso_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permisos_id_permiso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permisos_id_permiso_seq OWNER TO postgres;

--
-- TOC entry 5351 (class 0 OID 0)
-- Dependencies: 231
-- Name: permisos_id_permiso_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permisos_id_permiso_seq OWNED BY public.permisos.id_permiso;


--
-- TOC entry 220 (class 1259 OID 17536)
-- Name: planes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.planes (
    id_plan integer NOT NULL,
    nombre character varying(50) NOT NULL,
    descripcion character varying(250),
    precio numeric(10,2),
    estado character varying DEFAULT 'Activo'::character varying NOT NULL
);


ALTER TABLE public.planes OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 18216)
-- Name: planes_creditos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.planes_creditos (
    id integer NOT NULL,
    id_plan integer NOT NULL,
    tipo_recurso character varying(50) NOT NULL,
    creditos_mensuales integer NOT NULL
);


ALTER TABLE public.planes_creditos OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 18215)
-- Name: planes_creditos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.planes_creditos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.planes_creditos_id_seq OWNER TO postgres;

--
-- TOC entry 5352 (class 0 OID 0)
-- Dependencies: 264
-- Name: planes_creditos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.planes_creditos_id_seq OWNED BY public.planes_creditos.id;


--
-- TOC entry 222 (class 1259 OID 17544)
-- Name: planes_funcionalidades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.planes_funcionalidades (
    id integer NOT NULL,
    id_plan integer NOT NULL,
    funcionalidad character varying(50) NOT NULL,
    nivel_acceso character varying(50),
    limite_numerico integer
);


ALTER TABLE public.planes_funcionalidades OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 17543)
-- Name: planes_funcionalidades_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.planes_funcionalidades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.planes_funcionalidades_id_seq OWNER TO postgres;

--
-- TOC entry 5353 (class 0 OID 0)
-- Dependencies: 221
-- Name: planes_funcionalidades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.planes_funcionalidades_id_seq OWNED BY public.planes_funcionalidades.id;


--
-- TOC entry 219 (class 1259 OID 17535)
-- Name: planes_id_plan_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.planes_id_plan_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.planes_id_plan_seq OWNER TO postgres;

--
-- TOC entry 5354 (class 0 OID 0)
-- Dependencies: 219
-- Name: planes_id_plan_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.planes_id_plan_seq OWNED BY public.planes.id_plan;


--
-- TOC entry 240 (class 1259 OID 17791)
-- Name: pre_capacitaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pre_capacitaciones (
    id_capacitacion integer NOT NULL,
    id_empresa integer NOT NULL,
    nombre character varying(100) NOT NULL,
    objetivo_estrategico character varying(200),
    id_cuestionario integer NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    descripcion text,
    estado boolean DEFAULT true,
    borrador boolean DEFAULT true,
    requiere_pdf boolean DEFAULT true,
    tipo character varying,
    id_admin integer,
    fecha_activacion timestamp without time zone
);


ALTER TABLE public.pre_capacitaciones OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 18238)
-- Name: pre_capacitaciones_archivos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pre_capacitaciones_archivos (
    id_archivo integer NOT NULL,
    id_capacitacion integer NOT NULL,
    id_empresa integer NOT NULL,
    url_archivo text NOT NULL,
    nombre_original text,
    fecha_subida timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pre_capacitaciones_archivos OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 18237)
-- Name: pre_capacitaciones_archivos_id_archivo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pre_capacitaciones_archivos_id_archivo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pre_capacitaciones_archivos_id_archivo_seq OWNER TO postgres;

--
-- TOC entry 5355 (class 0 OID 0)
-- Dependencies: 266
-- Name: pre_capacitaciones_archivos_id_archivo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pre_capacitaciones_archivos_id_archivo_seq OWNED BY public.pre_capacitaciones_archivos.id_archivo;


--
-- TOC entry 242 (class 1259 OID 17811)
-- Name: pre_capacitaciones_departamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pre_capacitaciones_departamentos (
    id integer NOT NULL,
    id_capacitacion integer NOT NULL,
    id_departamento integer NOT NULL,
    id_empresa integer NOT NULL
);


ALTER TABLE public.pre_capacitaciones_departamentos OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 17810)
-- Name: pre_capacitaciones_departamentos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pre_capacitaciones_departamentos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pre_capacitaciones_departamentos_id_seq OWNER TO postgres;

--
-- TOC entry 5356 (class 0 OID 0)
-- Dependencies: 241
-- Name: pre_capacitaciones_departamentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pre_capacitaciones_departamentos_id_seq OWNED BY public.pre_capacitaciones_departamentos.id;


--
-- TOC entry 239 (class 1259 OID 17790)
-- Name: pre_capacitaciones_id_capacitacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pre_capacitaciones_id_capacitacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pre_capacitaciones_id_capacitacion_seq OWNER TO postgres;

--
-- TOC entry 5357 (class 0 OID 0)
-- Dependencies: 239
-- Name: pre_capacitaciones_id_capacitacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pre_capacitaciones_id_capacitacion_seq OWNED BY public.pre_capacitaciones.id_capacitacion;


--
-- TOC entry 236 (class 1259 OID 17751)
-- Name: preguntas_catalogo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.preguntas_catalogo (
    id_pregunta integer NOT NULL,
    id_cuestionario integer NOT NULL,
    id_empresa integer NOT NULL,
    tipo character varying(20) NOT NULL,
    texto character varying(500) NOT NULL,
    estado boolean DEFAULT true,
    url_imagen text
);


ALTER TABLE public.preguntas_catalogo OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 17750)
-- Name: preguntas_catalogo_id_pregunta_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.preguntas_catalogo_id_pregunta_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.preguntas_catalogo_id_pregunta_seq OWNER TO postgres;

--
-- TOC entry 5358 (class 0 OID 0)
-- Dependencies: 235
-- Name: preguntas_catalogo_id_pregunta_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.preguntas_catalogo_id_pregunta_seq OWNED BY public.preguntas_catalogo.id_pregunta;


--
-- TOC entry 275 (class 1259 OID 18324)
-- Name: preguntas_usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.preguntas_usuarios (
    id_pregunta_usuario integer NOT NULL,
    id_cuestionario_usuario integer NOT NULL,
    id_empresa integer NOT NULL,
    tipo character varying NOT NULL,
    texto text NOT NULL,
    url_imagen text,
    estado boolean DEFAULT true
);


ALTER TABLE public.preguntas_usuarios OWNER TO postgres;

--
-- TOC entry 274 (class 1259 OID 18323)
-- Name: preguntas_usuarios_id_pregunta_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.preguntas_usuarios_id_pregunta_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.preguntas_usuarios_id_pregunta_usuario_seq OWNER TO postgres;

--
-- TOC entry 5359 (class 0 OID 0)
-- Dependencies: 274
-- Name: preguntas_usuarios_id_pregunta_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.preguntas_usuarios_id_pregunta_usuario_seq OWNED BY public.preguntas_usuarios.id_pregunta_usuario;


--
-- TOC entry 244 (class 1259 OID 17833)
-- Name: reportes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reportes (
    id_reporte integer NOT NULL,
    id_empresa integer NOT NULL,
    tipo_reporte character varying(50) NOT NULL,
    fecha_generado timestamp without time zone DEFAULT now() NOT NULL,
    url_reporte character varying(500)
);


ALTER TABLE public.reportes OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 17832)
-- Name: reportes_id_reporte_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reportes_id_reporte_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reportes_id_reporte_seq OWNER TO postgres;

--
-- TOC entry 5360 (class 0 OID 0)
-- Dependencies: 243
-- Name: reportes_id_reporte_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reportes_id_reporte_seq OWNED BY public.reportes.id_reporte;


--
-- TOC entry 287 (class 1259 OID 18590)
-- Name: resultados_cuestionario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resultados_cuestionario (
    id_resultado integer NOT NULL,
    id_usuario_capacitacion integer NOT NULL,
    id_intento integer NOT NULL,
    id_empresa integer NOT NULL,
    nota numeric NOT NULL,
    aprobado boolean NOT NULL,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.resultados_cuestionario OWNER TO postgres;

--
-- TOC entry 286 (class 1259 OID 18589)
-- Name: resultados_cuestionario_id_resultado_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.resultados_cuestionario_id_resultado_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.resultados_cuestionario_id_resultado_seq OWNER TO postgres;

--
-- TOC entry 5361 (class 0 OID 0)
-- Dependencies: 286
-- Name: resultados_cuestionario_id_resultado_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.resultados_cuestionario_id_resultado_seq OWNED BY public.resultados_cuestionario.id_resultado;


--
-- TOC entry 293 (class 1259 OID 18656)
-- Name: resumen_capacitacion_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resumen_capacitacion_usuario (
    id_resumen integer NOT NULL,
    id_asignacion integer NOT NULL,
    id_empresa integer NOT NULL,
    id_usuario integer NOT NULL,
    id_capacitacion integer NOT NULL,
    nota_final numeric,
    aprobado boolean,
    fecha_ultimo_intento timestamp without time zone,
    intentos_realizados integer DEFAULT 0,
    tiempo_promedio_respuesta interval,
    estado_final character varying(30)
);


ALTER TABLE public.resumen_capacitacion_usuario OWNER TO postgres;

--
-- TOC entry 292 (class 1259 OID 18655)
-- Name: resumen_capacitacion_usuario_id_resumen_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.resumen_capacitacion_usuario_id_resumen_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.resumen_capacitacion_usuario_id_resumen_seq OWNER TO postgres;

--
-- TOC entry 5362 (class 0 OID 0)
-- Dependencies: 292
-- Name: resumen_capacitacion_usuario_id_resumen_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.resumen_capacitacion_usuario_id_resumen_seq OWNED BY public.resumen_capacitacion_usuario.id_resumen;


--
-- TOC entry 228 (class 1259 OID 17692)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id_rol integer NOT NULL,
    nombre character varying(50) NOT NULL,
    descripcion character varying(250)
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 17691)
-- Name: roles_id_rol_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_rol_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_rol_seq OWNER TO postgres;

--
-- TOC entry 5363 (class 0 OID 0)
-- Dependencies: 227
-- Name: roles_id_rol_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_rol_seq OWNED BY public.roles.id_rol;


--
-- TOC entry 255 (class 1259 OID 18088)
-- Name: sesiones_activas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sesiones_activas (
    id_sesion integer NOT NULL,
    id_usuario integer NOT NULL,
    id_empresa integer NOT NULL,
    fecha_inicio timestamp without time zone DEFAULT now() NOT NULL,
    fecha_fin timestamp without time zone,
    estado character varying(20) NOT NULL,
    ip text,
    user_agent text
);


ALTER TABLE public.sesiones_activas OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 18087)
-- Name: sesiones_activas_id_sesion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sesiones_activas_id_sesion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sesiones_activas_id_sesion_seq OWNER TO postgres;

--
-- TOC entry 5364 (class 0 OID 0)
-- Dependencies: 254
-- Name: sesiones_activas_id_sesion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sesiones_activas_id_sesion_seq OWNED BY public.sesiones_activas.id_sesion;


--
-- TOC entry 224 (class 1259 OID 17556)
-- Name: suscripciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suscripciones (
    id_suscripcion integer NOT NULL,
    id_empresa integer NOT NULL,
    id_plan integer NOT NULL,
    fecha_inicio date,
    fecha_fin date,
    estado character varying(20) NOT NULL
);


ALTER TABLE public.suscripciones OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17555)
-- Name: suscripciones_id_suscripcion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.suscripciones_id_suscripcion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.suscripciones_id_suscripcion_seq OWNER TO postgres;

--
-- TOC entry 5365 (class 0 OID 0)
-- Dependencies: 223
-- Name: suscripciones_id_suscripcion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.suscripciones_id_suscripcion_seq OWNED BY public.suscripciones.id_suscripcion;


--
-- TOC entry 230 (class 1259 OID 17704)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id_usuario integer NOT NULL,
    id_empresa integer NOT NULL,
    codigo_empleado character varying(50),
    nombre character varying(50) NOT NULL,
    apellido character varying(50),
    correo character varying(100) NOT NULL,
    password_hash character varying(256) NOT NULL,
    id_rol integer NOT NULL,
    estado character varying(20) DEFAULT 'Activo'::character varying NOT NULL,
    ultimo_login timestamp without time zone,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 18277)
-- Name: usuarios_capacitaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios_capacitaciones (
    id_asignacion integer NOT NULL,
    id_empresa integer NOT NULL,
    id_usuario integer NOT NULL,
    id_capacitacion integer NOT NULL,
    estado character varying DEFAULT 'pendiente'::character varying,
    mensaje_personalizado text,
    fecha_asignacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_completado timestamp without time zone,
    nota_obtenida numeric,
    aprobado boolean
);


ALTER TABLE public.usuarios_capacitaciones OWNER TO postgres;

--
-- TOC entry 270 (class 1259 OID 18276)
-- Name: usuarios_capacitaciones_id_asignacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_capacitaciones_id_asignacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_capacitaciones_id_asignacion_seq OWNER TO postgres;

--
-- TOC entry 5366 (class 0 OID 0)
-- Dependencies: 270
-- Name: usuarios_capacitaciones_id_asignacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_capacitaciones_id_asignacion_seq OWNED BY public.usuarios_capacitaciones.id_asignacion;


--
-- TOC entry 253 (class 1259 OID 18072)
-- Name: usuarios_departamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios_departamentos (
    id_usuario integer NOT NULL,
    id_departamento integer NOT NULL,
    id_empresa integer,
    fecha_asignacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.usuarios_departamentos OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 17703)
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_usuario_seq OWNER TO postgres;

--
-- TOC entry 5367 (class 0 OID 0)
-- Dependencies: 229
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_usuario_seq OWNED BY public.usuarios.id_usuario;


--
-- TOC entry 4980 (class 2604 OID 18143)
-- Name: bitacora id_log; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bitacora ALTER COLUMN id_log SET DEFAULT nextval('public.bitacora_id_log_seq'::regclass);


--
-- TOC entry 5014 (class 2604 OID 18505)
-- Name: capacitacion_departamento_usuario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.capacitacion_departamento_usuario ALTER COLUMN id SET DEFAULT nextval('public.capacitacion_departamento_usuario_id_seq'::regclass);


--
-- TOC entry 4992 (class 2604 OID 18262)
-- Name: capacitaciones_activas id_capacitacion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.capacitaciones_activas ALTER COLUMN id_capacitacion SET DEFAULT nextval('public.capacitaciones_activas_id_capacitacion_seq'::regclass);


--
-- TOC entry 5027 (class 2604 OID 18687)
-- Name: capacitaciones_activas_archivos id_archivo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.capacitaciones_activas_archivos ALTER COLUMN id_archivo SET DEFAULT nextval('public.capacitaciones_activas_archivos_id_archivo_seq'::regclass);


--
-- TOC entry 5011 (class 2604 OID 18477)
-- Name: certificados id_certificado; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificados ALTER COLUMN id_certificado SET DEFAULT nextval('public.certificados_id_certificado_seq'::regclass);


--
-- TOC entry 4987 (class 2604 OID 18200)
-- Name: consumo_creditos id_consumo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumo_creditos ALTER COLUMN id_consumo SET DEFAULT nextval('public.consumo_creditos_id_consumo_seq'::regclass);


--
-- TOC entry 4951 (class 2604 OID 17740)
-- Name: cuestionarios_catalogo id_cuestionario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuestionarios_catalogo ALTER COLUMN id_cuestionario SET DEFAULT nextval('public.cuestionarios_catalogo_id_cuestionario_seq'::regclass);


--
-- TOC entry 5000 (class 2604 OID 18306)
-- Name: cuestionarios_usuarios id_cuestionario_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuestionarios_usuarios ALTER COLUMN id_cuestionario_usuario SET DEFAULT nextval('public.cuestionarios_usuarios_id_cuestionario_usuario_seq'::regclass);


--
-- TOC entry 4943 (class 2604 OID 17629)
-- Name: departamentos id_departamento; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departamentos ALTER COLUMN id_departamento SET DEFAULT nextval('public.departamentos_id_departamento_seq'::regclass);


--
-- TOC entry 4936 (class 2604 OID 17530)
-- Name: empresas id_empresa; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresas ALTER COLUMN id_empresa SET DEFAULT nextval('public.empresas_id_empresa_seq'::regclass);


--
-- TOC entry 5022 (class 2604 OID 18638)
-- Name: errores_intentos id_error; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.errores_intentos ALTER COLUMN id_error SET DEFAULT nextval('public.errores_intentos_id_error_seq'::regclass);


--
-- TOC entry 5008 (class 2604 OID 18446)
-- Name: gamificacion id_gamificacion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamificacion ALTER COLUMN id_gamificacion SET DEFAULT nextval('public.gamificacion_id_gamificacion_seq'::regclass);


--
-- TOC entry 5020 (class 2604 OID 18618)
-- Name: historial_interacciones_capacitacion id_historial; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_interacciones_capacitacion ALTER COLUMN id_historial SET DEFAULT nextval('public.historial_interacciones_capacitacion_id_historial_seq'::regclass);


--
-- TOC entry 4974 (class 2604 OID 18041)
-- Name: insignias id_insignia; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insignias ALTER COLUMN id_insignia SET DEFAULT nextval('public.insignias_id_insignia_seq'::regclass);


--
-- TOC entry 4975 (class 2604 OID 18053)
-- Name: insignias_usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insignias_usuarios ALTER COLUMN id SET DEFAULT nextval('public.insignias_usuarios_id_seq'::regclass);


--
-- TOC entry 5016 (class 2604 OID 18558)
-- Name: intentos_cuestionario id_intento; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.intentos_cuestionario ALTER COLUMN id_intento SET DEFAULT nextval('public.intentos_cuestionario_id_intento_seq'::regclass);


--
-- TOC entry 4984 (class 2604 OID 18173)
-- Name: licencias_empresas id_licencia; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licencias_empresas ALTER COLUMN id_licencia SET DEFAULT nextval('public.licencias_empresas_id_licencia_seq'::regclass);


--
-- TOC entry 4982 (class 2604 OID 18153)
-- Name: log_errores id_error; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.log_errores ALTER COLUMN id_error SET DEFAULT nextval('public.log_errores_id_error_seq'::regclass);


--
-- TOC entry 4972 (class 2604 OID 17872)
-- Name: metricas id_metrica; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metricas ALTER COLUMN id_metrica SET DEFAULT nextval('public.metricas_id_metrica_seq'::regclass);


--
-- TOC entry 4969 (class 2604 OID 17851)
-- Name: notificaciones id_notificacion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones ALTER COLUMN id_notificacion SET DEFAULT nextval('public.notificaciones_id_notificacion_seq'::regclass);


--
-- TOC entry 4958 (class 2604 OID 17773)
-- Name: opciones_catalogo id_opcion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opciones_catalogo ALTER COLUMN id_opcion SET DEFAULT nextval('public.opciones_catalogo_id_opcion_seq'::regclass);


--
-- TOC entry 5005 (class 2604 OID 18347)
-- Name: opciones_usuarios id_opcion_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opciones_usuarios ALTER COLUMN id_opcion_usuario SET DEFAULT nextval('public.opciones_usuarios_id_opcion_usuario_seq'::regclass);


--
-- TOC entry 4950 (class 2604 OID 17728)
-- Name: permisos id_permiso; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permisos ALTER COLUMN id_permiso SET DEFAULT nextval('public.permisos_id_permiso_seq'::regclass);


--
-- TOC entry 4939 (class 2604 OID 17539)
-- Name: planes id_plan; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planes ALTER COLUMN id_plan SET DEFAULT nextval('public.planes_id_plan_seq'::regclass);


--
-- TOC entry 4989 (class 2604 OID 18219)
-- Name: planes_creditos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planes_creditos ALTER COLUMN id SET DEFAULT nextval('public.planes_creditos_id_seq'::regclass);


--
-- TOC entry 4941 (class 2604 OID 17547)
-- Name: planes_funcionalidades id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planes_funcionalidades ALTER COLUMN id SET DEFAULT nextval('public.planes_funcionalidades_id_seq'::regclass);


--
-- TOC entry 4961 (class 2604 OID 17794)
-- Name: pre_capacitaciones id_capacitacion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_capacitaciones ALTER COLUMN id_capacitacion SET DEFAULT nextval('public.pre_capacitaciones_id_capacitacion_seq'::regclass);


--
-- TOC entry 4990 (class 2604 OID 18241)
-- Name: pre_capacitaciones_archivos id_archivo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_capacitaciones_archivos ALTER COLUMN id_archivo SET DEFAULT nextval('public.pre_capacitaciones_archivos_id_archivo_seq'::regclass);


--
-- TOC entry 4966 (class 2604 OID 17814)
-- Name: pre_capacitaciones_departamentos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_capacitaciones_departamentos ALTER COLUMN id SET DEFAULT nextval('public.pre_capacitaciones_departamentos_id_seq'::regclass);


--
-- TOC entry 4956 (class 2604 OID 17754)
-- Name: preguntas_catalogo id_pregunta; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preguntas_catalogo ALTER COLUMN id_pregunta SET DEFAULT nextval('public.preguntas_catalogo_id_pregunta_seq'::regclass);


--
-- TOC entry 5003 (class 2604 OID 18327)
-- Name: preguntas_usuarios id_pregunta_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preguntas_usuarios ALTER COLUMN id_pregunta_usuario SET DEFAULT nextval('public.preguntas_usuarios_id_pregunta_usuario_seq'::regclass);


--
-- TOC entry 4967 (class 2604 OID 17836)
-- Name: reportes id_reporte; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reportes ALTER COLUMN id_reporte SET DEFAULT nextval('public.reportes_id_reporte_seq'::regclass);


--
-- TOC entry 5018 (class 2604 OID 18593)
-- Name: resultados_cuestionario id_resultado; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resultados_cuestionario ALTER COLUMN id_resultado SET DEFAULT nextval('public.resultados_cuestionario_id_resultado_seq'::regclass);


--
-- TOC entry 5025 (class 2604 OID 18659)
-- Name: resumen_capacitacion_usuario id_resumen; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resumen_capacitacion_usuario ALTER COLUMN id_resumen SET DEFAULT nextval('public.resumen_capacitacion_usuario_id_resumen_seq'::regclass);


--
-- TOC entry 4946 (class 2604 OID 17695)
-- Name: roles id_rol; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id_rol SET DEFAULT nextval('public.roles_id_rol_seq'::regclass);


--
-- TOC entry 4978 (class 2604 OID 18091)
-- Name: sesiones_activas id_sesion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesiones_activas ALTER COLUMN id_sesion SET DEFAULT nextval('public.sesiones_activas_id_sesion_seq'::regclass);


--
-- TOC entry 4942 (class 2604 OID 17559)
-- Name: suscripciones id_suscripcion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suscripciones ALTER COLUMN id_suscripcion SET DEFAULT nextval('public.suscripciones_id_suscripcion_seq'::regclass);


--
-- TOC entry 4947 (class 2604 OID 17707)
-- Name: usuarios id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuarios_id_usuario_seq'::regclass);


--
-- TOC entry 4997 (class 2604 OID 18280)
-- Name: usuarios_capacitaciones id_asignacion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_capacitaciones ALTER COLUMN id_asignacion SET DEFAULT nextval('public.usuarios_capacitaciones_id_asignacion_seq'::regclass);


--
-- TOC entry 5075 (class 2606 OID 18148)
-- Name: bitacora bitacora_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bitacora
    ADD CONSTRAINT bitacora_pkey PRIMARY KEY (id_log);


--
-- TOC entry 5101 (class 2606 OID 18508)
-- Name: capacitacion_departamento_usuario capacitacion_departamento_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.capacitacion_departamento_usuario
    ADD CONSTRAINT capacitacion_departamento_usuario_pkey PRIMARY KEY (id);


--
-- TOC entry 5116 (class 2606 OID 18692)
-- Name: capacitaciones_activas_archivos capacitaciones_activas_archivos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.capacitaciones_activas_archivos
    ADD CONSTRAINT capacitaciones_activas_archivos_pkey PRIMARY KEY (id_archivo);


--
-- TOC entry 5087 (class 2606 OID 18270)
-- Name: capacitaciones_activas capacitaciones_activas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.capacitaciones_activas
    ADD CONSTRAINT capacitaciones_activas_pkey PRIMARY KEY (id_capacitacion);


--
-- TOC entry 5099 (class 2606 OID 18483)
-- Name: certificados certificados_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificados
    ADD CONSTRAINT certificados_pkey PRIMARY KEY (id_certificado);


--
-- TOC entry 5081 (class 2606 OID 18205)
-- Name: consumo_creditos consumo_creditos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumo_creditos
    ADD CONSTRAINT consumo_creditos_pkey PRIMARY KEY (id_consumo);


--
-- TOC entry 5051 (class 2606 OID 17744)
-- Name: cuestionarios_catalogo cuestionarios_catalogo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuestionarios_catalogo
    ADD CONSTRAINT cuestionarios_catalogo_pkey PRIMARY KEY (id_cuestionario);


--
-- TOC entry 5091 (class 2606 OID 18312)
-- Name: cuestionarios_usuarios cuestionarios_usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuestionarios_usuarios
    ADD CONSTRAINT cuestionarios_usuarios_pkey PRIMARY KEY (id_cuestionario_usuario);


--
-- TOC entry 5041 (class 2606 OID 17631)
-- Name: departamentos departamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departamentos
    ADD CONSTRAINT departamentos_pkey PRIMARY KEY (id_departamento);


--
-- TOC entry 5030 (class 2606 OID 17534)
-- Name: empresas empresas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresas
    ADD CONSTRAINT empresas_pkey PRIMARY KEY (id_empresa);


--
-- TOC entry 5032 (class 2606 OID 18137)
-- Name: empresas empresas_slug_empresa_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresas
    ADD CONSTRAINT empresas_slug_empresa_key UNIQUE (slug_empresa);


--
-- TOC entry 5110 (class 2606 OID 18644)
-- Name: errores_intentos errores_intentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.errores_intentos
    ADD CONSTRAINT errores_intentos_pkey PRIMARY KEY (id_error);


--
-- TOC entry 5097 (class 2606 OID 18452)
-- Name: gamificacion gamificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamificacion
    ADD CONSTRAINT gamificacion_pkey PRIMARY KEY (id_gamificacion);


--
-- TOC entry 5108 (class 2606 OID 18623)
-- Name: historial_interacciones_capacitacion historial_interacciones_capacitacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_interacciones_capacitacion
    ADD CONSTRAINT historial_interacciones_capacitacion_pkey PRIMARY KEY (id_historial);


--
-- TOC entry 5067 (class 2606 OID 18043)
-- Name: insignias insignias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insignias
    ADD CONSTRAINT insignias_pkey PRIMARY KEY (id_insignia);


--
-- TOC entry 5069 (class 2606 OID 18056)
-- Name: insignias_usuarios insignias_usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insignias_usuarios
    ADD CONSTRAINT insignias_usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 5103 (class 2606 OID 18563)
-- Name: intentos_cuestionario intentos_cuestionario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.intentos_cuestionario
    ADD CONSTRAINT intentos_cuestionario_pkey PRIMARY KEY (id_intento);


--
-- TOC entry 5079 (class 2606 OID 18177)
-- Name: licencias_empresas licencias_empresas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licencias_empresas
    ADD CONSTRAINT licencias_empresas_pkey PRIMARY KEY (id_licencia);


--
-- TOC entry 5077 (class 2606 OID 18158)
-- Name: log_errores log_errores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.log_errores
    ADD CONSTRAINT log_errores_pkey PRIMARY KEY (id_error);


--
-- TOC entry 5065 (class 2606 OID 17875)
-- Name: metricas metricas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metricas
    ADD CONSTRAINT metricas_pkey PRIMARY KEY (id_metrica);


--
-- TOC entry 5063 (class 2606 OID 17857)
-- Name: notificaciones notificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_pkey PRIMARY KEY (id_notificacion);


--
-- TOC entry 5055 (class 2606 OID 17778)
-- Name: opciones_catalogo opciones_catalogo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opciones_catalogo
    ADD CONSTRAINT opciones_catalogo_pkey PRIMARY KEY (id_opcion);


--
-- TOC entry 5095 (class 2606 OID 18353)
-- Name: opciones_usuarios opciones_usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opciones_usuarios
    ADD CONSTRAINT opciones_usuarios_pkey PRIMARY KEY (id_opcion_usuario);


--
-- TOC entry 5049 (class 2606 OID 17730)
-- Name: permisos permisos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permisos
    ADD CONSTRAINT permisos_pkey PRIMARY KEY (id_permiso);


--
-- TOC entry 5083 (class 2606 OID 18221)
-- Name: planes_creditos planes_creditos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planes_creditos
    ADD CONSTRAINT planes_creditos_pkey PRIMARY KEY (id);


--
-- TOC entry 5037 (class 2606 OID 17549)
-- Name: planes_funcionalidades planes_funcionalidades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planes_funcionalidades
    ADD CONSTRAINT planes_funcionalidades_pkey PRIMARY KEY (id);


--
-- TOC entry 5035 (class 2606 OID 17542)
-- Name: planes planes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planes
    ADD CONSTRAINT planes_pkey PRIMARY KEY (id_plan);


--
-- TOC entry 5085 (class 2606 OID 18246)
-- Name: pre_capacitaciones_archivos pre_capacitaciones_archivos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_capacitaciones_archivos
    ADD CONSTRAINT pre_capacitaciones_archivos_pkey PRIMARY KEY (id_archivo);


--
-- TOC entry 5059 (class 2606 OID 17816)
-- Name: pre_capacitaciones_departamentos pre_capacitaciones_departamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_capacitaciones_departamentos
    ADD CONSTRAINT pre_capacitaciones_departamentos_pkey PRIMARY KEY (id);


--
-- TOC entry 5057 (class 2606 OID 17799)
-- Name: pre_capacitaciones pre_capacitaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_capacitaciones
    ADD CONSTRAINT pre_capacitaciones_pkey PRIMARY KEY (id_capacitacion);


--
-- TOC entry 5053 (class 2606 OID 17758)
-- Name: preguntas_catalogo preguntas_catalogo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preguntas_catalogo
    ADD CONSTRAINT preguntas_catalogo_pkey PRIMARY KEY (id_pregunta);


--
-- TOC entry 5093 (class 2606 OID 18332)
-- Name: preguntas_usuarios preguntas_usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preguntas_usuarios
    ADD CONSTRAINT preguntas_usuarios_pkey PRIMARY KEY (id_pregunta_usuario);


--
-- TOC entry 5061 (class 2606 OID 17841)
-- Name: reportes reportes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reportes
    ADD CONSTRAINT reportes_pkey PRIMARY KEY (id_reporte);


--
-- TOC entry 5105 (class 2606 OID 18598)
-- Name: resultados_cuestionario resultados_cuestionario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resultados_cuestionario
    ADD CONSTRAINT resultados_cuestionario_pkey PRIMARY KEY (id_resultado);


--
-- TOC entry 5112 (class 2606 OID 18666)
-- Name: resumen_capacitacion_usuario resumen_capacitacion_usuario_id_asignacion_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resumen_capacitacion_usuario
    ADD CONSTRAINT resumen_capacitacion_usuario_id_asignacion_key UNIQUE (id_asignacion);


--
-- TOC entry 5114 (class 2606 OID 18664)
-- Name: resumen_capacitacion_usuario resumen_capacitacion_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resumen_capacitacion_usuario
    ADD CONSTRAINT resumen_capacitacion_usuario_pkey PRIMARY KEY (id_resumen);


--
-- TOC entry 5045 (class 2606 OID 17697)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id_rol);


--
-- TOC entry 5073 (class 2606 OID 18094)
-- Name: sesiones_activas sesiones_activas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesiones_activas
    ADD CONSTRAINT sesiones_activas_pkey PRIMARY KEY (id_sesion);


--
-- TOC entry 5039 (class 2606 OID 17561)
-- Name: suscripciones suscripciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suscripciones
    ADD CONSTRAINT suscripciones_pkey PRIMARY KEY (id_suscripcion);


--
-- TOC entry 5043 (class 2606 OID 18233)
-- Name: departamentos unique_nombre_departamento_empresa; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departamentos
    ADD CONSTRAINT unique_nombre_departamento_empresa UNIQUE (id_empresa, nombre);


--
-- TOC entry 5089 (class 2606 OID 18286)
-- Name: usuarios_capacitaciones usuarios_capacitaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_capacitaciones
    ADD CONSTRAINT usuarios_capacitaciones_pkey PRIMARY KEY (id_asignacion);


--
-- TOC entry 5071 (class 2606 OID 18076)
-- Name: usuarios_departamentos usuarios_departamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_departamentos
    ADD CONSTRAINT usuarios_departamentos_pkey PRIMARY KEY (id_usuario, id_departamento);


--
-- TOC entry 5047 (class 2606 OID 17713)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);


--
-- TOC entry 5033 (class 1259 OID 18138)
-- Name: idx_slug_empresa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_slug_empresa ON public.empresas USING btree (slug_empresa);


--
-- TOC entry 5106 (class 1259 OID 18682)
-- Name: resultados_unicos_por_asignacion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX resultados_unicos_por_asignacion ON public.resultados_cuestionario USING btree (id_usuario_capacitacion);


--
-- TOC entry 5149 (class 2606 OID 18271)
-- Name: capacitaciones_activas capacitaciones_activas_id_empresa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.capacitaciones_activas
    ADD CONSTRAINT capacitaciones_activas_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa);


--
-- TOC entry 5163 (class 2606 OID 18494)
-- Name: certificados certificados_id_asignacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificados
    ADD CONSTRAINT certificados_id_asignacion_fkey FOREIGN KEY (id_asignacion) REFERENCES public.usuarios_capacitaciones(id_asignacion);


--
-- TOC entry 5164 (class 2606 OID 18484)
-- Name: certificados certificados_id_empresa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificados
    ADD CONSTRAINT certificados_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa);


--
-- TOC entry 5165 (class 2606 OID 18489)
-- Name: certificados certificados_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificados
    ADD CONSTRAINT certificados_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


--
-- TOC entry 5153 (class 2606 OID 18313)
-- Name: cuestionarios_usuarios cuestionarios_usuarios_id_capacitacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuestionarios_usuarios
    ADD CONSTRAINT cuestionarios_usuarios_id_capacitacion_fkey FOREIGN KEY (id_capacitacion) REFERENCES public.capacitaciones_activas(id_capacitacion);


--
-- TOC entry 5154 (class 2606 OID 18318)
-- Name: cuestionarios_usuarios cuestionarios_usuarios_id_empresa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuestionarios_usuarios
    ADD CONSTRAINT cuestionarios_usuarios_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa);


--
-- TOC entry 5166 (class 2606 OID 18564)
-- Name: intentos_cuestionario fk_asignacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.intentos_cuestionario
    ADD CONSTRAINT fk_asignacion FOREIGN KEY (id_asignacion) REFERENCES public.usuarios_capacitaciones(id_asignacion);


--
-- TOC entry 5172 (class 2606 OID 18624)
-- Name: historial_interacciones_capacitacion fk_asignacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_interacciones_capacitacion
    ADD CONSTRAINT fk_asignacion FOREIGN KEY (id_asignacion) REFERENCES public.usuarios_capacitaciones(id_asignacion);


--
-- TOC entry 5167 (class 2606 OID 18574)
-- Name: intentos_cuestionario fk_cuestionario_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.intentos_cuestionario
    ADD CONSTRAINT fk_cuestionario_usuario FOREIGN KEY (id_cuestionario_usuario) REFERENCES public.cuestionarios_usuarios(id_cuestionario_usuario);


--
-- TOC entry 5124 (class 2606 OID 17745)
-- Name: cuestionarios_catalogo fk_cuestionarios_empresa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuestionarios_catalogo
    ADD CONSTRAINT fk_cuestionarios_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa) ON DELETE CASCADE;


--
-- TOC entry 5120 (class 2606 OID 17632)
-- Name: departamentos fk_departamentos_empresa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departamentos
    ADD CONSTRAINT fk_departamentos_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa);


--
-- TOC entry 5168 (class 2606 OID 18569)
-- Name: intentos_cuestionario fk_empresa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.intentos_cuestionario
    ADD CONSTRAINT fk_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa);


--
-- TOC entry 5174 (class 2606 OID 18645)
-- Name: errores_intentos fk_empresa_errores; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.errores_intentos
    ADD CONSTRAINT fk_empresa_errores FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa);


--
-- TOC entry 5173 (class 2606 OID 18629)
-- Name: historial_interacciones_capacitacion fk_empresa_hist; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_interacciones_capacitacion
    ADD CONSTRAINT fk_empresa_hist FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa);


--
-- TOC entry 5169 (class 2606 OID 18609)
-- Name: resultados_cuestionario fk_empresa_res; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resultados_cuestionario
    ADD CONSTRAINT fk_empresa_res FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa);


--
-- TOC entry 5138 (class 2606 OID 18044)
-- Name: insignias fk_insignias_empresa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insignias
    ADD CONSTRAINT fk_insignias_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa);


--
-- TOC entry 5170 (class 2606 OID 18604)
-- Name: resultados_cuestionario fk_intento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resultados_cuestionario
    ADD CONSTRAINT fk_intento FOREIGN KEY (id_intento) REFERENCES public.intentos_cuestionario(id_intento);


--
-- TOC entry 5139 (class 2606 OID 18067)
-- Name: insignias_usuarios fk_iu_empresa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insignias_usuarios
    ADD CONSTRAINT fk_iu_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa) ON DELETE CASCADE;


--
-- TOC entry 5140 (class 2606 OID 18057)
-- Name: insignias_usuarios fk_iu_insignia; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insignias_usuarios
    ADD CONSTRAINT fk_iu_insignia FOREIGN KEY (id_insignia) REFERENCES public.insignias(id_insignia) ON DELETE CASCADE;


--
-- TOC entry 5141 (class 2606 OID 18062)
-- Name: insignias_usuarios fk_iu_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insignias_usuarios
    ADD CONSTRAINT fk_iu_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- TOC entry 5137 (class 2606 OID 17876)
-- Name: metricas fk_metricas_empresa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metricas
    ADD CONSTRAINT fk_metricas_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa);


--
-- TOC entry 5135 (class 2606 OID 17863)
-- Name: notificaciones fk_notificaciones_empresa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT fk_notificaciones_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa) ON DELETE CASCADE;


--
-- TOC entry 5136 (class 2606 OID 17858)
-- Name: notificaciones fk_notificaciones_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT fk_notificaciones_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- TOC entry 5127 (class 2606 OID 17784)
-- Name: opciones_catalogo fk_opciones_empresa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opciones_catalogo
    ADD CONSTRAINT fk_opciones_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa) ON DELETE CASCADE;


--
-- TOC entry 5128 (class 2606 OID 17779)
-- Name: opciones_catalogo fk_opciones_pregunta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opciones_catalogo
    ADD CONSTRAINT fk_opciones_pregunta FOREIGN KEY (id_pregunta) REFERENCES public.preguntas_catalogo(id_pregunta) ON DELETE CASCADE;


--
-- TOC entry 5123 (class 2606 OID 17731)
-- Name: permisos fk_permisos_rol; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permisos
    ADD CONSTRAINT fk_permisos_rol FOREIGN KEY (id_rol) REFERENCES public.roles(id_rol) ON DELETE CASCADE;


--
-- TOC entry 5117 (class 2606 OID 17550)
-- Name: planes_funcionalidades fk_planes_funcionalidades_plan; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planes_funcionalidades
    ADD CONSTRAINT fk_planes_funcionalidades_plan FOREIGN KEY (id_plan) REFERENCES public.planes(id_plan);


--
-- TOC entry 5131 (class 2606 OID 17817)
-- Name: pre_capacitaciones_departamentos fk_pre_cap_dept_capacitacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_capacitaciones_departamentos
    ADD CONSTRAINT fk_pre_cap_dept_capacitacion FOREIGN KEY (id_capacitacion) REFERENCES public.pre_capacitaciones(id_capacitacion) ON DELETE CASCADE;


--
-- TOC entry 5132 (class 2606 OID 17822)
-- Name: pre_capacitaciones_departamentos fk_pre_cap_dept_departamento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_capacitaciones_departamentos
    ADD CONSTRAINT fk_pre_cap_dept_departamento FOREIGN KEY (id_departamento) REFERENCES public.departamentos(id_departamento) ON DELETE CASCADE;


--
-- TOC entry 5133 (class 2606 OID 17827)
-- Name: pre_capacitaciones_departamentos fk_pre_cap_dept_empresa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_capacitaciones_departamentos
    ADD CONSTRAINT fk_pre_cap_dept_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa) ON DELETE CASCADE;


--
-- TOC entry 5129 (class 2606 OID 17805)
-- Name: pre_capacitaciones fk_pre_capacitaciones_cuestionario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_capacitaciones
    ADD CONSTRAINT fk_pre_capacitaciones_cuestionario FOREIGN KEY (id_cuestionario) REFERENCES public.cuestionarios_catalogo(id_cuestionario);


--
-- TOC entry 5130 (class 2606 OID 17800)
-- Name: pre_capacitaciones fk_pre_capacitaciones_empresa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_capacitaciones
    ADD CONSTRAINT fk_pre_capacitaciones_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa);


--
-- TOC entry 5125 (class 2606 OID 17759)
-- Name: preguntas_catalogo fk_preguntas_cuestionario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preguntas_catalogo
    ADD CONSTRAINT fk_preguntas_cuestionario FOREIGN KEY (id_cuestionario) REFERENCES public.cuestionarios_catalogo(id_cuestionario) ON DELETE CASCADE;


--
-- TOC entry 5126 (class 2606 OID 17764)
-- Name: preguntas_catalogo fk_preguntas_empresa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preguntas_catalogo
    ADD CONSTRAINT fk_preguntas_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa) ON DELETE CASCADE;


--
-- TOC entry 5134 (class 2606 OID 17842)
-- Name: reportes fk_reportes_empresa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reportes
    ADD CONSTRAINT fk_reportes_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa) ON DELETE CASCADE;


--
-- TOC entry 5144 (class 2606 OID 18100)
-- Name: sesiones_activas fk_sesiones_activas_empresa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesiones_activas
    ADD CONSTRAINT fk_sesiones_activas_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa) ON DELETE CASCADE;


--
-- TOC entry 5145 (class 2606 OID 18095)
-- Name: sesiones_activas fk_sesiones_activas_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesiones_activas
    ADD CONSTRAINT fk_sesiones_activas_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


--
-- TOC entry 5118 (class 2606 OID 17562)
-- Name: suscripciones fk_suscripciones_empresa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suscripciones
    ADD CONSTRAINT fk_suscripciones_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa);


--
-- TOC entry 5119 (class 2606 OID 17567)
-- Name: suscripciones fk_suscripciones_plan; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suscripciones
    ADD CONSTRAINT fk_suscripciones_plan FOREIGN KEY (id_plan) REFERENCES public.planes(id_plan);


--
-- TOC entry 5142 (class 2606 OID 18082)
-- Name: usuarios_departamentos fk_ud_departamento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_departamentos
    ADD CONSTRAINT fk_ud_departamento FOREIGN KEY (id_departamento) REFERENCES public.departamentos(id_departamento);


--
-- TOC entry 5143 (class 2606 OID 18077)
-- Name: usuarios_departamentos fk_ud_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_departamentos
    ADD CONSTRAINT fk_ud_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


--
-- TOC entry 5175 (class 2606 OID 18650)
-- Name: errores_intentos fk_usuario_capacitacion_errores; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.errores_intentos
    ADD CONSTRAINT fk_usuario_capacitacion_errores FOREIGN KEY (id_asignacion) REFERENCES public.usuarios_capacitaciones(id_asignacion);


--
-- TOC entry 5171 (class 2606 OID 18599)
-- Name: resultados_cuestionario fk_usuario_capacitacion_res; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resultados_cuestionario
    ADD CONSTRAINT fk_usuario_capacitacion_res FOREIGN KEY (id_usuario_capacitacion) REFERENCES public.usuarios_capacitaciones(id_asignacion);


--
-- TOC entry 5121 (class 2606 OID 17714)
-- Name: usuarios fk_usuarios_empresa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT fk_usuarios_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa) ON DELETE CASCADE;


--
-- TOC entry 5122 (class 2606 OID 17719)
-- Name: usuarios fk_usuarios_rol; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT fk_usuarios_rol FOREIGN KEY (id_rol) REFERENCES public.roles(id_rol);


--
-- TOC entry 5159 (class 2606 OID 18463)
-- Name: gamificacion gamificacion_id_asignacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamificacion
    ADD CONSTRAINT gamificacion_id_asignacion_fkey FOREIGN KEY (id_asignacion) REFERENCES public.usuarios_capacitaciones(id_asignacion);


--
-- TOC entry 5160 (class 2606 OID 18468)
-- Name: gamificacion gamificacion_id_cuestionario_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamificacion
    ADD CONSTRAINT gamificacion_id_cuestionario_usuario_fkey FOREIGN KEY (id_cuestionario_usuario) REFERENCES public.cuestionarios_usuarios(id_cuestionario_usuario);


--
-- TOC entry 5161 (class 2606 OID 18453)
-- Name: gamificacion gamificacion_id_empresa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamificacion
    ADD CONSTRAINT gamificacion_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa);


--
-- TOC entry 5162 (class 2606 OID 18458)
-- Name: gamificacion gamificacion_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gamificacion
    ADD CONSTRAINT gamificacion_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


--
-- TOC entry 5157 (class 2606 OID 18359)
-- Name: opciones_usuarios opciones_usuarios_id_empresa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opciones_usuarios
    ADD CONSTRAINT opciones_usuarios_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa);


--
-- TOC entry 5158 (class 2606 OID 18354)
-- Name: opciones_usuarios opciones_usuarios_id_pregunta_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opciones_usuarios
    ADD CONSTRAINT opciones_usuarios_id_pregunta_usuario_fkey FOREIGN KEY (id_pregunta_usuario) REFERENCES public.preguntas_usuarios(id_pregunta_usuario);


--
-- TOC entry 5146 (class 2606 OID 18222)
-- Name: planes_creditos planes_creditos_id_plan_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planes_creditos
    ADD CONSTRAINT planes_creditos_id_plan_fkey FOREIGN KEY (id_plan) REFERENCES public.planes(id_plan);


--
-- TOC entry 5147 (class 2606 OID 18247)
-- Name: pre_capacitaciones_archivos pre_capacitaciones_archivos_id_capacitacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_capacitaciones_archivos
    ADD CONSTRAINT pre_capacitaciones_archivos_id_capacitacion_fkey FOREIGN KEY (id_capacitacion) REFERENCES public.pre_capacitaciones(id_capacitacion);


--
-- TOC entry 5148 (class 2606 OID 18252)
-- Name: pre_capacitaciones_archivos pre_capacitaciones_archivos_id_empresa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_capacitaciones_archivos
    ADD CONSTRAINT pre_capacitaciones_archivos_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa);


--
-- TOC entry 5155 (class 2606 OID 18333)
-- Name: preguntas_usuarios preguntas_usuarios_id_cuestionario_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preguntas_usuarios
    ADD CONSTRAINT preguntas_usuarios_id_cuestionario_usuario_fkey FOREIGN KEY (id_cuestionario_usuario) REFERENCES public.cuestionarios_usuarios(id_cuestionario_usuario);


--
-- TOC entry 5156 (class 2606 OID 18338)
-- Name: preguntas_usuarios preguntas_usuarios_id_empresa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preguntas_usuarios
    ADD CONSTRAINT preguntas_usuarios_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa);


--
-- TOC entry 5176 (class 2606 OID 18667)
-- Name: resumen_capacitacion_usuario resumen_capacitacion_usuario_id_asignacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resumen_capacitacion_usuario
    ADD CONSTRAINT resumen_capacitacion_usuario_id_asignacion_fkey FOREIGN KEY (id_asignacion) REFERENCES public.usuarios_capacitaciones(id_asignacion) ON DELETE CASCADE;


--
-- TOC entry 5177 (class 2606 OID 18677)
-- Name: resumen_capacitacion_usuario resumen_capacitacion_usuario_id_capacitacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resumen_capacitacion_usuario
    ADD CONSTRAINT resumen_capacitacion_usuario_id_capacitacion_fkey FOREIGN KEY (id_capacitacion) REFERENCES public.capacitaciones_activas(id_capacitacion) ON DELETE CASCADE;


--
-- TOC entry 5178 (class 2606 OID 18672)
-- Name: resumen_capacitacion_usuario resumen_capacitacion_usuario_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resumen_capacitacion_usuario
    ADD CONSTRAINT resumen_capacitacion_usuario_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- TOC entry 5150 (class 2606 OID 18297)
-- Name: usuarios_capacitaciones usuarios_capacitaciones_id_capacitacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_capacitaciones
    ADD CONSTRAINT usuarios_capacitaciones_id_capacitacion_fkey FOREIGN KEY (id_capacitacion) REFERENCES public.capacitaciones_activas(id_capacitacion);


--
-- TOC entry 5151 (class 2606 OID 18287)
-- Name: usuarios_capacitaciones usuarios_capacitaciones_id_empresa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_capacitaciones
    ADD CONSTRAINT usuarios_capacitaciones_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES public.empresas(id_empresa);


--
-- TOC entry 5152 (class 2606 OID 18292)
-- Name: usuarios_capacitaciones usuarios_capacitaciones_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_capacitaciones
    ADD CONSTRAINT usuarios_capacitaciones_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


-- Completed on 2025-04-03 08:21:48

--
-- PostgreSQL database dump complete
--

