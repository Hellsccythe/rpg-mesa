-- Schema completo do banco RPG de Mesa
-- Gerado em: 2026-09-10 por pg_dump --schema-only, direto do banco em Docker (porta 5433).
--
-- Para aplicar do zero:        psql -d rpg_mesa -f docs/SCHEMA_CURRENT.sql
-- Para atualizar um existente: rode as migrations em database/migrations/ em ordem.
--
-- Arquivo GERADO, nao editado a mao. Para regerar:
--   docker exec rpg_mesa_postgres pg_dump -U postgres -d rpg_mesa \
--     --schema-only --schema=public --no-owner --no-privileges --no-comments
--
-- PostgreSQL database dump
--
-- PostgreSQL database dump
--

\restrict 1Egq2nUcmacTbuNr3MY4jvj6pauV30e6DVbopwUPW6ox47VMxq9kVcbPFGLQ20l

-- Dumped from database version 18.6 (Debian 18.6-1.pgdg13+2)
-- Dumped by pg_dump version 18.6 (Debian 18.6-1.pgdg13+2)

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: exportar_schema_ddl(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.exportar_schema_ddl() RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_out     TEXT;
  r_tab     RECORD;
  r_col     RECORD;
  r_idx     RECORD;
  v_sep     TEXT;
  v_tipo    TEXT;
  v_pk_cols TEXT;
BEGIN
  v_out := '-- Esquema gerado em: ' || to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') || ' UTC'
        || E'\n-- Banco: ' || current_database()
        || E'\n\n';

  FOR r_tab IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  LOOP
    v_out := v_out || 'CREATE TABLE IF NOT EXISTS ' || quote_ident(r_tab.table_name) || ' (' || E'\n';
    v_sep  := '';

    FOR r_col IN
      SELECT
        column_name, data_type, udt_name, is_nullable,
        column_default, character_maximum_length,
        numeric_precision, numeric_scale,
        is_identity, identity_generation
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = r_tab.table_name
      ORDER BY ordinal_position
    LOOP
      -- Resolve tipo
      v_tipo := CASE
        WHEN r_col.data_type = 'ARRAY' THEN
          CASE r_col.udt_name
            WHEN '_int2'    THEN 'SMALLINT[]'
            WHEN '_int4'    THEN 'INTEGER[]'
            WHEN '_int8'    THEN 'BIGINT[]'
            WHEN '_text'    THEN 'TEXT[]'
            WHEN '_varchar' THEN 'TEXT[]'
            WHEN '_uuid'    THEN 'UUID[]'
            WHEN '_bool'    THEN 'BOOLEAN[]'
            ELSE 'TEXT[]'
          END
        WHEN r_col.data_type = 'USER-DEFINED' THEN
          CASE r_col.udt_name
            WHEN 'uuid'   THEN 'UUID'
            WHEN 'citext' THEN 'CITEXT'
            ELSE r_col.udt_name
          END
        WHEN r_col.data_type = 'character varying' THEN
          CASE WHEN r_col.character_maximum_length IS NOT NULL
               THEN 'VARCHAR(' || r_col.character_maximum_length || ')'
               ELSE 'TEXT' END
        WHEN r_col.data_type = 'character' THEN
          'CHAR(' || COALESCE(r_col.character_maximum_length::TEXT, '1') || ')'
        WHEN r_col.data_type = 'numeric' THEN
          CASE WHEN r_col.numeric_precision IS NOT NULL
               THEN 'NUMERIC(' || r_col.numeric_precision || ',' || r_col.numeric_scale || ')'
               ELSE 'NUMERIC' END
        WHEN r_col.data_type = 'integer'                     THEN 'INTEGER'
        WHEN r_col.data_type = 'bigint'                      THEN 'BIGINT'
        WHEN r_col.data_type = 'smallint'                    THEN 'SMALLINT'
        WHEN r_col.data_type = 'boolean'                     THEN 'BOOLEAN'
        WHEN r_col.data_type = 'text'                        THEN 'TEXT'
        WHEN r_col.data_type = 'jsonb'                       THEN 'JSONB'
        WHEN r_col.data_type = 'json'                        THEN 'JSON'
        WHEN r_col.data_type = 'timestamp with time zone'    THEN 'TIMESTAMPTZ'
        WHEN r_col.data_type = 'timestamp without time zone' THEN 'TIMESTAMP'
        WHEN r_col.data_type = 'date'                        THEN 'DATE'
        WHEN r_col.data_type = 'double precision'            THEN 'DOUBLE PRECISION'
        WHEN r_col.data_type = 'real'                        THEN 'REAL'
        WHEN r_col.data_type = 'interval'                    THEN 'INTERVAL'
        ELSE upper(r_col.data_type)
      END;

      v_out := v_out || v_sep || '  ' || quote_ident(r_col.column_name) || ' ' || v_tipo;

      -- IDENTITY (migration 022+)
      IF r_col.is_identity = 'YES' THEN
        v_out := v_out || ' GENERATED ' || r_col.identity_generation || ' AS IDENTITY';

      -- SERIAL legado (nextval) → converte para IDENTITY BY DEFAULT
      ELSIF r_col.column_default IS NOT NULL
        AND r_col.column_default LIKE 'nextval(%'
        AND r_col.data_type IN ('integer', 'bigint', 'smallint')
      THEN
        v_out := v_out || ' GENERATED BY DEFAULT AS IDENTITY';

      -- DEFAULT normal
      ELSIF r_col.column_default IS NOT NULL THEN
        v_out := v_out || ' DEFAULT ' || r_col.column_default;
      END IF;

      -- NOT NULL (IDENTITY e SERIAL já são implicitamente NOT NULL)
      IF r_col.is_nullable = 'NO'
         AND r_col.is_identity = 'NO'
         AND NOT (
           COALESCE(r_col.column_default, '') LIKE 'nextval(%'
           AND r_col.data_type IN ('integer', 'bigint', 'smallint')
         )
      THEN
        v_out := v_out || ' NOT NULL';
      END IF;

      v_sep := ',' || E'\n';
    END LOOP;

    -- PRIMARY KEY
    SELECT string_agg(quote_ident(kcu.column_name), ', ' ORDER BY kcu.ordinal_position)
    INTO v_pk_cols
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON kcu.constraint_name = tc.constraint_name
     AND kcu.table_schema    = tc.table_schema
    WHERE tc.table_schema    = 'public'
      AND tc.table_name      = r_tab.table_name
      AND tc.constraint_type = 'PRIMARY KEY';

    IF v_pk_cols IS NOT NULL THEN
      v_out := v_out || ',' || E'\n' || '  PRIMARY KEY (' || v_pk_cols || ')';
    END IF;

    v_out := v_out || E'\n);\n\n';
  END LOOP;

  -- Índices (exclui PKs; UNIQUE constraints aparecem como CREATE UNIQUE INDEX)
  v_out := v_out || E'-- Indexes\n';
  FOR r_idx IN
    SELECT indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname  NOT LIKE '%_pkey'
    ORDER BY tablename, indexname
  LOOP
    v_out := v_out || r_idx.indexdef || E';\n';
  END LOOP;

  RETURN v_out;
END;
$$;


--
-- Name: rls_auto_enable(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.rls_auto_enable() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


--
-- Name: set_atualizado_em(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_atualizado_em() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_racas_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_racas_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_timestamp_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: set_updated_at_city_maps(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at_city_maps() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$;


--
-- Name: sync_gods_image_fields(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_gods_image_fields() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
IF NEW.image_url IS NULL AND NEW.image_path IS NOT NULL THEN
NEW.image_url := NEW.image_path;
ELSIF NEW.image_path IS NULL AND NEW.image_url IS NOT NULL THEN
NEW.image_path := NEW.image_url;
END IF;

RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: campaign_gms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_gms (
    id integer NOT NULL,
    email text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_at timestamp with time zone DEFAULT now(),
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text,
    campaign_id integer NOT NULL
);


--
-- Name: campaign_gms_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.campaign_gms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: campaign_gms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.campaign_gms_id_seq OWNED BY public.campaign_gms.id;


--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaigns (
    slug character varying(60) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    cover_image_url text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text,
    id integer CONSTRAINT campaigns_new_id_not_null NOT NULL
);


--
-- Name: campaigns_new_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.campaigns ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.campaigns_new_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: categoria_arma; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categoria_arma (
    item integer NOT NULL,
    descricao character varying(100) NOT NULL,
    uso_equipamento_item integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text
);


--
-- Name: categoria_arma_item_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categoria_arma_item_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categoria_arma_item_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categoria_arma_item_seq OWNED BY public.categoria_arma.item;


--
-- Name: categoria_armadura; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categoria_armadura (
    item integer NOT NULL,
    descricao character varying(100) NOT NULL,
    uso_equipamento_item integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text
);


--
-- Name: categoria_armadura_item_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categoria_armadura_item_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categoria_armadura_item_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categoria_armadura_item_seq OWNED BY public.categoria_armadura.item;


--
-- Name: categoria_consumivel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categoria_consumivel (
    item integer NOT NULL,
    descricao character varying(100) NOT NULL,
    icone character varying(100),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text
);


--
-- Name: categoria_consumivel_item_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.categoria_consumivel ALTER COLUMN item ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.categoria_consumivel_item_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: categoria_equipamento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categoria_equipamento (
    item integer NOT NULL,
    descricao character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by text,
    created_by text,
    updated_by text,
    classe_item integer,
    icone character varying(60)
);


--
-- Name: categoria_equipamento_item_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categoria_equipamento_item_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categoria_equipamento_item_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categoria_equipamento_item_seq OWNED BY public.categoria_equipamento.item;


--
-- Name: categoria_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categoria_item (
    item integer NOT NULL,
    descricao character varying(100) NOT NULL,
    icone character varying(100),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text
);


--
-- Name: categoria_item_item_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.categoria_item ALTER COLUMN item ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.categoria_item_item_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: categoria_variados; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categoria_variados (
    item integer NOT NULL,
    descricao character varying(100) NOT NULL,
    uso_equipamento_item integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text
);


--
-- Name: categoria_variados_item_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categoria_variados_item_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categoria_variados_item_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categoria_variados_item_seq OWNED BY public.categoria_variados.item;


--
-- Name: character_creation_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.character_creation_requests (
    id integer NOT NULL,
    email text NOT NULL,
    username text NOT NULL,
    password_hash text NOT NULL,
    nome text NOT NULL,
    avatar_url text,
    indole_id integer,
    genero_id integer,
    aparencia_fisica text NOT NULL,
    historia_texto text,
    historia_doc_url text,
    status character varying(20) DEFAULT 'pendente'::character varying NOT NULL,
    rejeitado_motivo text,
    revisado_em timestamp with time zone,
    revisado_por text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by text,
    created_by text,
    updated_by text,
    campaign_id integer,
    CONSTRAINT character_creation_requests_status_check CHECK (((status)::text = ANY (ARRAY[('pendente'::character varying)::text, ('aprovado'::character varying)::text, ('rejeitado'::character varying)::text])))
);


--
-- Name: character_creation_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.character_creation_requests ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.character_creation_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: character_creation_whitelist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.character_creation_whitelist (
    email text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text,
    id integer NOT NULL,
    CONSTRAINT character_creation_whitelist_email_not_empty CHECK ((length(TRIM(BOTH FROM email)) > 3))
);


--
-- Name: character_creation_whitelist__new_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.character_creation_whitelist ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.character_creation_whitelist__new_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: characters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.characters (
    name text NOT NULL,
    level integer DEFAULT 1 NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    avatar_url text,
    deleted_at timestamp with time zone,
    deleted_by text,
    username text,
    created_by text,
    updated_by text,
    id integer NOT NULL,
    indole_id integer,
    genero_id integer,
    aparencia_fisica text,
    historia_texto text,
    historia_doc_url text,
    raca_id integer,
    passado_id integer,
    classe_id integer,
    deus_id integer,
    onboarding_completo boolean DEFAULT false NOT NULL,
    status text DEFAULT 'vivo'::text NOT NULL,
    campaign_id integer,
    user_id integer CONSTRAINT characters_new_user_id_not_null NOT NULL,
    CONSTRAINT characters_status_check CHECK ((status = ANY (ARRAY['vivo'::text, 'morto'::text])))
);


--
-- Name: characters__new_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.characters ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.characters__new_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: city_maps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.city_maps (
    id integer NOT NULL,
    name text NOT NULL,
    map_reference text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_by text,
    created_by text,
    updated_by text
);


--
-- Name: city_maps_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.city_maps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: city_maps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.city_maps_id_seq OWNED BY public.city_maps.id;


--
-- Name: class_level_progression; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.class_level_progression (
    id integer NOT NULL,
    classe_id integer NOT NULL,
    nivel integer NOT NULL,
    xp_necessario integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by text,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text,
    CONSTRAINT class_level_progression_nivel_check CHECK (((nivel >= 1) AND (nivel <= 20))),
    CONSTRAINT class_level_progression_xp_necessario_check CHECK ((xp_necessario >= 0))
);


--
-- Name: class_level_progression_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.class_level_progression ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.class_level_progression_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: classe_arma; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.classe_arma (
    item integer NOT NULL,
    descricao character varying(100) NOT NULL,
    categoria_arma_item integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text
);


--
-- Name: classe_arma_item_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.classe_arma_item_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: classe_arma_item_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.classe_arma_item_seq OWNED BY public.classe_arma.item;


--
-- Name: classe_armadura; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.classe_armadura (
    item integer NOT NULL,
    descricao character varying(100) NOT NULL,
    categoria_armadura_item integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text
);


--
-- Name: classe_armadura_item_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.classe_armadura_item_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: classe_armadura_item_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.classe_armadura_item_seq OWNED BY public.classe_armadura.item;


--
-- Name: classe_equipamento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.classe_equipamento (
    item integer NOT NULL,
    descricao character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by text,
    created_by text,
    updated_by text,
    icone character varying(60)
);


--
-- Name: classe_equipamento_item_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.classe_equipamento_item_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: classe_equipamento_item_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.classe_equipamento_item_seq OWNED BY public.classe_equipamento.item;


--
-- Name: classe_marco_virtude; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.classe_marco_virtude (
    id integer NOT NULL,
    classe_id integer NOT NULL,
    nivel integer NOT NULL,
    pontos integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_by text,
    CONSTRAINT classe_marco_virtude_nivel_check CHECK ((nivel = ANY (ARRAY[5, 10, 15, 20]))),
    CONSTRAINT classe_marco_virtude_pontos_check CHECK (((pontos >= 0) AND (pontos <= 10)))
);


--
-- Name: classe_marco_virtude_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.classe_marco_virtude ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.classe_marco_virtude_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: classe_secreta_revelada; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.classe_secreta_revelada (
    id integer NOT NULL,
    classe_id integer NOT NULL,
    character_id integer NOT NULL,
    revealed_at timestamp with time zone DEFAULT now() NOT NULL,
    revealed_by text,
    created_at timestamp with time zone DEFAULT now(),
    created_by text,
    updated_at timestamp with time zone DEFAULT now(),
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text
);


--
-- Name: classe_secreta_revelada_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.classe_secreta_revelada ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.classe_secreta_revelada_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: classe_variados; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.classe_variados (
    item integer NOT NULL,
    descricao character varying(100) NOT NULL,
    categoria_variados_item integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text
);


--
-- Name: classe_variados_item_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.classe_variados_item_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: classe_variados_item_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.classe_variados_item_seq OWNED BY public.classe_variados.item;


--
-- Name: classes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.classes (
    id integer NOT NULL,
    name text NOT NULL,
    tier text NOT NULL,
    description text NOT NULL,
    max_level integer DEFAULT 20 NOT NULL,
    requirements jsonb DEFAULT '{}'::jsonb NOT NULL,
    stat_bonuses jsonb DEFAULT '{}'::jsonb NOT NULL,
    starting_skills text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_by text,
    created_by text,
    updated_by text,
    requer_deus boolean DEFAULT false NOT NULL,
    is_secret boolean DEFAULT false NOT NULL,
    passive_skills text[],
    signature_skill text,
    signature_skill_nivel integer,
    CONSTRAINT classes_tier_check CHECK ((tier = ANY (ARRAY['Base'::text, 'Híbrida'::text, 'Hidden'::text])))
);


--
-- Name: classes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.classes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: classes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.classes_id_seq OWNED BY public.classes.id;


--
-- Name: condicoes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.condicoes (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    descricao text DEFAULT ''::text NOT NULL,
    efeito text DEFAULT ''::text NOT NULL,
    categoria character varying(20) NOT NULL,
    raridade_item integer,
    duracao character varying(60) DEFAULT ''::character varying NOT NULL,
    janela_de_cura character varying(60),
    se_nao_tratada text,
    acumulativa boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text,
    CONSTRAINT condicoes_categoria_check CHECK (((categoria)::text = ANY ((ARRAY['Física'::character varying, 'Mental'::character varying, 'Mágica'::character varying, 'Doença'::character varying, 'Alquímica'::character varying])::text[])))
);


--
-- Name: condicoes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.condicoes ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.condicoes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: consumiveis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consumiveis (
    id integer NOT NULL,
    nome character varying(255) NOT NULL,
    descricao text,
    efeito text DEFAULT ''::text NOT NULL,
    usos integer DEFAULT 1 NOT NULL,
    duracao character varying(60),
    peso numeric(8,2),
    valor numeric(12,2),
    raridade_item integer,
    categoria_consumivel_item integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text,
    via character varying(20),
    cura_dado character varying(20),
    cura_percentual integer,
    efeito_bemfeito text,
    CONSTRAINT consumiveis_cura_percentual_check CHECK (((cura_percentual IS NULL) OR ((cura_percentual >= 0) AND (cura_percentual <= 100)))),
    CONSTRAINT consumiveis_via_check CHECK (((via IS NULL) OR ((via)::text = ANY ((ARRAY['lamina'::character varying, 'ingestao'::character varying, 'contato'::character varying])::text[]))))
);


--
-- Name: consumiveis_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.consumiveis ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.consumiveis_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: consumivel_condicao; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consumivel_condicao (
    id integer NOT NULL,
    consumivel_id integer NOT NULL,
    condicao_id integer NOT NULL,
    acao character varying(10) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    CONSTRAINT consumivel_condicao_acao_check CHECK (((acao)::text = ANY ((ARRAY['cura'::character varying, 'previne'::character varying, 'inflige'::character varying])::text[])))
);


--
-- Name: consumivel_condicao_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.consumivel_condicao ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.consumivel_condicao_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: uso_equipamento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.uso_equipamento (
    item integer CONSTRAINT equipamento_tipo_item_not_null NOT NULL,
    descricao character varying(100) CONSTRAINT equipamento_tipo_descricao_not_null NOT NULL,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT equipamento_tipo_created_at_not_null NOT NULL,
    created_by text,
    updated_at timestamp with time zone DEFAULT now() CONSTRAINT equipamento_tipo_updated_at_not_null NOT NULL,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text
);


--
-- Name: equipamento_tipo_item_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.equipamento_tipo_item_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: equipamento_tipo_item_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.equipamento_tipo_item_seq OWNED BY public.uso_equipamento.item;


--
-- Name: equipamentos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipamentos (
    nome character varying(255) NOT NULL,
    dano character varying(60) NOT NULL,
    peso numeric(8,2),
    valor numeric(12,2),
    deleted_at timestamp with time zone,
    deleted_by text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    descricao_equipamento character varying(500),
    pre_requisitos character varying(300),
    created_by text,
    updated_by text,
    tipo_equipamento_item integer[] DEFAULT '{}'::integer[] NOT NULL,
    propriedade_equipamento_item integer[] DEFAULT '{}'::integer[] NOT NULL,
    categoria_equipamento_item integer,
    classe_equipamento_item integer[] DEFAULT '{}'::integer[] NOT NULL,
    id integer NOT NULL,
    raridade_item integer,
    dano_alternativo character varying(20),
    multiplicador_critico integer,
    tipo_dano_item integer,
    defesa_fisica integer,
    defesa_magica integer,
    pericia_id integer,
    alcance_ideal integer,
    alcance_maximo integer
);


--
-- Name: equipamentos__new_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.equipamentos ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.equipamentos__new_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: genero; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genero (
    id integer NOT NULL,
    codigo character varying(20) NOT NULL,
    descricao character varying(50) NOT NULL,
    pronome character varying(10) DEFAULT ''::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_at timestamp with time zone DEFAULT now(),
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text
);


--
-- Name: genero_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.genero ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.genero_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: gods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gods (
    id integer NOT NULL,
    name text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    image_path text,
    short_description text DEFAULT ''::text NOT NULL,
    indole text DEFAULT ''::text NOT NULL,
    dogma text DEFAULT ''::text NOT NULL,
    anatema text DEFAULT ''::text NOT NULL,
    weapons text DEFAULT ''::text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    title text,
    image_url text,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    deleted_by text,
    created_by text,
    updated_by text,
    indole_id integer
);


--
-- Name: gods_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gods_id_seq OWNED BY public.gods.id;


--
-- Name: indole; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.indole (
    id integer NOT NULL,
    codigo character varying(20) NOT NULL,
    descricao character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_at timestamp with time zone DEFAULT now(),
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text
);


--
-- Name: indole_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.indole ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.indole_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: itens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.itens (
    id integer NOT NULL,
    nome character varying(255) NOT NULL,
    descricao text,
    peso numeric(8,2),
    valor numeric(12,2),
    empilhavel boolean DEFAULT true NOT NULL,
    raridade_item integer,
    categoria_item integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text
);


--
-- Name: itens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.itens ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.itens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: level_progression; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.level_progression (
    id integer NOT NULL,
    level integer NOT NULL,
    tier text NOT NULL,
    multiplier numeric(4,2) NOT NULL,
    xp_required_next bigint NOT NULL,
    xp_total_accumulated bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    created_by text,
    updated_at timestamp with time zone DEFAULT now(),
    updated_by text,
    deleted_by text
);


--
-- Name: level_progression_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.level_progression_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: level_progression_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.level_progression_id_seq OWNED BY public.level_progression.id;


--
-- Name: lore_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lore_notes (
    title text NOT NULL,
    subtitle text,
    content text DEFAULT ''::text NOT NULL,
    ordem integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    pdf_url text,
    deleted_by text,
    created_by text,
    updated_by text,
    id integer NOT NULL,
    character_id integer
);


--
-- Name: lore_notes__new_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.lore_notes ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.lore_notes__new_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: npc_acesso_player; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.npc_acesso_player (
    id integer NOT NULL,
    npc_id integer NOT NULL,
    character_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_at timestamp with time zone DEFAULT now(),
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text
);


--
-- Name: npc_acesso_player_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.npc_acesso_player ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.npc_acesso_player_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: npcs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.npcs (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    raca_id integer,
    descricao text,
    foto_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text
);


--
-- Name: npcs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.npcs ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.npcs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: passados; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.passados (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    descricao text,
    foto_url text,
    skill_ids integer[] DEFAULT '{}'::integer[] NOT NULL,
    titulo_ids integer[] DEFAULT '{}'::integer[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text,
    atributo_bonus jsonb,
    dinheiro_inicial jsonb DEFAULT '[]'::jsonb NOT NULL,
    pericias_iniciais jsonb DEFAULT '[]'::jsonb NOT NULL
);


--
-- Name: passados_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.passados ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.passados_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: pericias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pericias (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    descricao text DEFAULT ''::text NOT NULL,
    atributo_base character varying(20) NOT NULL,
    categoria character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text,
    bolsa character varying(10) DEFAULT 'mundana'::character varying NOT NULL,
    capacidade_rank5_nome character varying(60),
    capacidade_rank5 text,
    CONSTRAINT pericias_atributo_check CHECK (((atributo_base)::text = ANY ((ARRAY['aura'::character varying, 'forca'::character varying, 'destreza'::character varying, 'resistencia'::character varying, 'inteligencia'::character varying])::text[]))),
    CONSTRAINT pericias_bolsa_check CHECK (((bolsa)::text = ANY ((ARRAY['mundana'::character varying, 'virtude'::character varying])::text[]))),
    CONSTRAINT pericias_categoria_check CHECK (((categoria)::text = ANY ((ARRAY['Ofício'::character varying, 'Social'::character varying, 'Corpo'::character varying, 'Saber'::character varying, 'Virtude'::character varying])::text[])))
);


--
-- Name: pericias_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.pericias ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.pericias_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: player_telas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.player_telas (
    id integer NOT NULL,
    character_id integer NOT NULL,
    tela text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_at timestamp with time zone DEFAULT now(),
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text
);


--
-- Name: player_telas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.player_telas ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.player_telas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: propriedade_arma; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.propriedade_arma (
    item integer NOT NULL,
    descricao character varying(100) NOT NULL,
    categoria_arma_item integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text
);


--
-- Name: propriedade_arma_item_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.propriedade_arma_item_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: propriedade_arma_item_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.propriedade_arma_item_seq OWNED BY public.propriedade_arma.item;


--
-- Name: propriedade_armadura; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.propriedade_armadura (
    item integer NOT NULL,
    descricao character varying(100) NOT NULL,
    categoria_armadura_item integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text
);


--
-- Name: propriedade_armadura_item_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.propriedade_armadura_item_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: propriedade_armadura_item_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.propriedade_armadura_item_seq OWNED BY public.propriedade_armadura.item;


--
-- Name: propriedade_equipamento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.propriedade_equipamento (
    item integer NOT NULL,
    descricao character varying(100) NOT NULL,
    classe_item integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by text,
    created_by text,
    updated_by text,
    categoria_item integer
);


--
-- Name: propriedade_equipamento_item_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.propriedade_equipamento_item_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: propriedade_equipamento_item_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.propriedade_equipamento_item_seq OWNED BY public.propriedade_equipamento.item;


--
-- Name: propriedade_variados; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.propriedade_variados (
    item integer NOT NULL,
    descricao character varying(100) NOT NULL,
    categoria_variados_item integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text
);


--
-- Name: propriedade_variados_item_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.propriedade_variados_item_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: propriedade_variados_item_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.propriedade_variados_item_seq OWNED BY public.propriedade_variados.item;


--
-- Name: racas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.racas (
    nome text NOT NULL,
    foto_url text,
    descricao text,
    lore text,
    habilidades jsonb DEFAULT '[]'::jsonb NOT NULL,
    atributos_bonus jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by text,
    created_by text,
    updated_by text,
    id integer NOT NULL
);


--
-- Name: racas__new_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.racas ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.racas__new_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: raridade; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.raridade (
    item integer NOT NULL,
    descricao character varying(100) NOT NULL,
    ordem integer NOT NULL,
    multiplicador_valor numeric(6,2) DEFAULT 1 NOT NULL,
    dificuldade_base integer,
    disponibilidade text DEFAULT ''::text NOT NULL,
    cor character varying(20) DEFAULT 'zinc'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text
);


--
-- Name: raridade_item_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.raridade ALTER COLUMN item ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.raridade_item_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: receita_ingredientes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.receita_ingredientes (
    id integer NOT NULL,
    receita_id integer NOT NULL,
    ingrediente_tabela character varying(20) NOT NULL,
    ingrediente_id integer NOT NULL,
    quantidade integer DEFAULT 1 NOT NULL,
    consumido boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_by text,
    CONSTRAINT receita_ingredientes_tabela_check CHECK (((ingrediente_tabela)::text = ANY ((ARRAY['consumiveis'::character varying, 'itens'::character varying, 'equipamentos'::character varying])::text[])))
);


--
-- Name: receita_ingredientes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.receita_ingredientes ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.receita_ingredientes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: receitas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.receitas (
    id integer NOT NULL,
    nome character varying(255) NOT NULL,
    descricao text,
    produto_tabela character varying(20) NOT NULL,
    produto_id integer NOT NULL,
    quantidade_produzida integer DEFAULT 1 NOT NULL,
    tempo_minutos integer DEFAULT 60 NOT NULL,
    dificuldade integer DEFAULT 10 NOT NULL,
    pericia_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text,
    CONSTRAINT receitas_produto_tabela_check CHECK (((produto_tabela)::text = ANY ((ARRAY['consumiveis'::character varying, 'itens'::character varying, 'equipamentos'::character varying])::text[])))
);


--
-- Name: receitas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.receitas ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.receitas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: regras_do_sistema; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.regras_do_sistema (
    chave character varying(60) NOT NULL,
    valor text NOT NULL,
    descricao text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by text
);


--
-- Name: skill_categoria; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skill_categoria (
    item integer NOT NULL,
    descricao character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text
);


--
-- Name: skill_categoria_item_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.skill_categoria_item_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: skill_categoria_item_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.skill_categoria_item_seq OWNED BY public.skill_categoria.item;


--
-- Name: skill_character_override; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skill_character_override (
    id integer NOT NULL,
    skill_name text NOT NULL,
    character_id integer NOT NULL,
    damage_base_override text,
    multiplicador_override text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text
);


--
-- Name: skill_character_override_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.skill_character_override ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.skill_character_override_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: skill_natureza; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skill_natureza (
    item integer NOT NULL,
    descricao character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text
);


--
-- Name: skill_natureza_item_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.skill_natureza ALTER COLUMN item ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.skill_natureza_item_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: skill_niveis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skill_niveis (
    id integer NOT NULL,
    skill_id integer NOT NULL,
    nivel integer NOT NULL,
    damage_multiplier_pct integer,
    nome_override character varying(100),
    damage_base_override text,
    multiplicador_override character varying(60),
    effect_description_override character varying(500),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by text,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text,
    CONSTRAINT skill_niveis_nivel_check CHECK ((nivel = ANY (ARRAY[2, 3])))
);


--
-- Name: skill_niveis_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.skill_niveis ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.skill_niveis_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: skill_tipo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skill_tipo (
    item integer NOT NULL,
    descricao character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text
);


--
-- Name: skill_tipo_dano; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skill_tipo_dano (
    item integer NOT NULL,
    descricao character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by text,
    deleted_at timestamp with time zone,
    deleted_by text
);


--
-- Name: skill_tipo_dano_item_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.skill_tipo_dano_item_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: skill_tipo_dano_item_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.skill_tipo_dano_item_seq OWNED BY public.skill_tipo_dano.item;


--
-- Name: skill_tipo_item_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.skill_tipo_item_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: skill_tipo_item_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.skill_tipo_item_seq OWNED BY public.skill_tipo.item;


--
-- Name: skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skills (
    id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    multiplicador_atributo text[],
    damage_base text,
    damage_modifier jsonb,
    damage_type text,
    effect_description text,
    cost jsonb,
    cooldown integer DEFAULT 0,
    range text,
    is_secret boolean DEFAULT false NOT NULL,
    required_class_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    raca_vinculada text[],
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_by text,
    created_by text,
    updated_by text,
    skill_tipo_item integer,
    skill_categoria_item integer[],
    skill_tipo_dano_item integer[],
    custo integer,
    required_class character varying(100),
    skill_natureza_item integer,
    nivel_minimo_classe integer
);


--
-- Name: skills_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.skills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.skills_id_seq OWNED BY public.skills.id;


--
-- Name: tipo_equipamento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipo_equipamento (
    item integer NOT NULL,
    descricao character varying(100) NOT NULL,
    classe_item integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by text,
    created_by text,
    updated_by text,
    categoria_item integer
);


--
-- Name: tipo_equipamento_item_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tipo_equipamento_item_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tipo_equipamento_item_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tipo_equipamento_item_seq OWNED BY public.tipo_equipamento.item;


--
-- Name: titles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.titles (
    id integer NOT NULL,
    name text NOT NULL,
    tier text NOT NULL,
    description text NOT NULL,
    bonuses jsonb DEFAULT '{}'::jsonb NOT NULL,
    requirements jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_hidden boolean DEFAULT false NOT NULL,
    linked_hidden_class boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_by text,
    created_by text,
    updated_by text,
    skill_ids integer[] DEFAULT '{}'::integer[] NOT NULL,
    classe_secreta_id integer,
    CONSTRAINT titles_tier_check CHECK ((tier = ANY (ARRAY['Comum'::text, 'Raro'::text, 'Épico'::text, 'Lendário'::text])))
);


--
-- Name: titles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.titles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: titles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.titles_id_seq OWNED BY public.titles.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    real_email text NOT NULL,
    username text,
    tipo text DEFAULT 'player'::text NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by text,
    created_by text,
    updated_by text,
    password_hash text,
    requires_password_change boolean DEFAULT false NOT NULL,
    CONSTRAINT usuarios_tipo_check CHECK ((tipo = ANY (ARRAY['gm'::text, 'player'::text])))
);


--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.usuarios ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.usuarios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: campaign_gms id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_gms ALTER COLUMN id SET DEFAULT nextval('public.campaign_gms_id_seq'::regclass);


--
-- Name: categoria_arma item; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categoria_arma ALTER COLUMN item SET DEFAULT nextval('public.categoria_arma_item_seq'::regclass);


--
-- Name: categoria_armadura item; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categoria_armadura ALTER COLUMN item SET DEFAULT nextval('public.categoria_armadura_item_seq'::regclass);


--
-- Name: categoria_equipamento item; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categoria_equipamento ALTER COLUMN item SET DEFAULT nextval('public.categoria_equipamento_item_seq'::regclass);


--
-- Name: categoria_variados item; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categoria_variados ALTER COLUMN item SET DEFAULT nextval('public.categoria_variados_item_seq'::regclass);


--
-- Name: city_maps id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.city_maps ALTER COLUMN id SET DEFAULT nextval('public.city_maps_id_seq'::regclass);


--
-- Name: classe_arma item; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classe_arma ALTER COLUMN item SET DEFAULT nextval('public.classe_arma_item_seq'::regclass);


--
-- Name: classe_armadura item; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classe_armadura ALTER COLUMN item SET DEFAULT nextval('public.classe_armadura_item_seq'::regclass);


--
-- Name: classe_equipamento item; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classe_equipamento ALTER COLUMN item SET DEFAULT nextval('public.classe_equipamento_item_seq'::regclass);


--
-- Name: classe_variados item; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classe_variados ALTER COLUMN item SET DEFAULT nextval('public.classe_variados_item_seq'::regclass);


--
-- Name: classes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes ALTER COLUMN id SET DEFAULT nextval('public.classes_id_seq'::regclass);


--
-- Name: gods id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gods ALTER COLUMN id SET DEFAULT nextval('public.gods_id_seq'::regclass);


--
-- Name: level_progression id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.level_progression ALTER COLUMN id SET DEFAULT nextval('public.level_progression_id_seq'::regclass);


--
-- Name: propriedade_arma item; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.propriedade_arma ALTER COLUMN item SET DEFAULT nextval('public.propriedade_arma_item_seq'::regclass);


--
-- Name: propriedade_armadura item; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.propriedade_armadura ALTER COLUMN item SET DEFAULT nextval('public.propriedade_armadura_item_seq'::regclass);


--
-- Name: propriedade_equipamento item; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.propriedade_equipamento ALTER COLUMN item SET DEFAULT nextval('public.propriedade_equipamento_item_seq'::regclass);


--
-- Name: propriedade_variados item; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.propriedade_variados ALTER COLUMN item SET DEFAULT nextval('public.propriedade_variados_item_seq'::regclass);


--
-- Name: skill_categoria item; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_categoria ALTER COLUMN item SET DEFAULT nextval('public.skill_categoria_item_seq'::regclass);


--
-- Name: skill_tipo item; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_tipo ALTER COLUMN item SET DEFAULT nextval('public.skill_tipo_item_seq'::regclass);


--
-- Name: skill_tipo_dano item; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_tipo_dano ALTER COLUMN item SET DEFAULT nextval('public.skill_tipo_dano_item_seq'::regclass);


--
-- Name: skills id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills ALTER COLUMN id SET DEFAULT nextval('public.skills_id_seq'::regclass);


--
-- Name: tipo_equipamento item; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_equipamento ALTER COLUMN item SET DEFAULT nextval('public.tipo_equipamento_item_seq'::regclass);


--
-- Name: titles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.titles ALTER COLUMN id SET DEFAULT nextval('public.titles_id_seq'::regclass);


--
-- Name: uso_equipamento item; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uso_equipamento ALTER COLUMN item SET DEFAULT nextval('public.equipamento_tipo_item_seq'::regclass);


--
-- Name: campaign_gms campaign_gms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_gms
    ADD CONSTRAINT campaign_gms_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_slug_key UNIQUE (slug);


--
-- Name: categoria_arma categoria_arma_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categoria_arma
    ADD CONSTRAINT categoria_arma_pkey PRIMARY KEY (item);


--
-- Name: categoria_armadura categoria_armadura_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categoria_armadura
    ADD CONSTRAINT categoria_armadura_pkey PRIMARY KEY (item);


--
-- Name: categoria_consumivel categoria_consumivel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categoria_consumivel
    ADD CONSTRAINT categoria_consumivel_pkey PRIMARY KEY (item);


--
-- Name: categoria_equipamento categoria_equipamento_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categoria_equipamento
    ADD CONSTRAINT categoria_equipamento_pkey PRIMARY KEY (item);


--
-- Name: categoria_item categoria_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categoria_item
    ADD CONSTRAINT categoria_item_pkey PRIMARY KEY (item);


--
-- Name: categoria_variados categoria_variados_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categoria_variados
    ADD CONSTRAINT categoria_variados_pkey PRIMARY KEY (item);


--
-- Name: character_creation_requests character_creation_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.character_creation_requests
    ADD CONSTRAINT character_creation_requests_pkey PRIMARY KEY (id);


--
-- Name: character_creation_whitelist character_creation_whitelist_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.character_creation_whitelist
    ADD CONSTRAINT character_creation_whitelist_email_key UNIQUE (email);


--
-- Name: character_creation_whitelist character_creation_whitelist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.character_creation_whitelist
    ADD CONSTRAINT character_creation_whitelist_pkey PRIMARY KEY (id);


--
-- Name: characters characters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.characters
    ADD CONSTRAINT characters_pkey PRIMARY KEY (id);


--
-- Name: city_maps city_maps_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.city_maps
    ADD CONSTRAINT city_maps_name_key UNIQUE (name);


--
-- Name: city_maps city_maps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.city_maps
    ADD CONSTRAINT city_maps_pkey PRIMARY KEY (id);


--
-- Name: class_level_progression class_level_progression_classe_id_nivel_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_level_progression
    ADD CONSTRAINT class_level_progression_classe_id_nivel_key UNIQUE (classe_id, nivel);


--
-- Name: class_level_progression class_level_progression_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_level_progression
    ADD CONSTRAINT class_level_progression_pkey PRIMARY KEY (id);


--
-- Name: classe_arma classe_arma_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classe_arma
    ADD CONSTRAINT classe_arma_pkey PRIMARY KEY (item);


--
-- Name: classe_armadura classe_armadura_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classe_armadura
    ADD CONSTRAINT classe_armadura_pkey PRIMARY KEY (item);


--
-- Name: classe_equipamento classe_equipamento_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classe_equipamento
    ADD CONSTRAINT classe_equipamento_pkey PRIMARY KEY (item);


--
-- Name: classe_marco_virtude classe_marco_virtude_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classe_marco_virtude
    ADD CONSTRAINT classe_marco_virtude_pkey PRIMARY KEY (id);


--
-- Name: classe_secreta_revelada classe_secreta_revelada_classe_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classe_secreta_revelada
    ADD CONSTRAINT classe_secreta_revelada_classe_id_key UNIQUE (classe_id);


--
-- Name: classe_secreta_revelada classe_secreta_revelada_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classe_secreta_revelada
    ADD CONSTRAINT classe_secreta_revelada_pkey PRIMARY KEY (id);


--
-- Name: classe_variados classe_variados_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classe_variados
    ADD CONSTRAINT classe_variados_pkey PRIMARY KEY (item);


--
-- Name: classes classes_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_name_key UNIQUE (name);


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- Name: condicoes condicoes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.condicoes
    ADD CONSTRAINT condicoes_pkey PRIMARY KEY (id);


--
-- Name: consumiveis consumiveis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consumiveis
    ADD CONSTRAINT consumiveis_pkey PRIMARY KEY (id);


--
-- Name: consumivel_condicao consumivel_condicao_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consumivel_condicao
    ADD CONSTRAINT consumivel_condicao_pkey PRIMARY KEY (id);


--
-- Name: uso_equipamento equipamento_tipo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uso_equipamento
    ADD CONSTRAINT equipamento_tipo_pkey PRIMARY KEY (item);


--
-- Name: equipamentos equipamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipamentos
    ADD CONSTRAINT equipamentos_pkey PRIMARY KEY (id);


--
-- Name: genero genero_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genero
    ADD CONSTRAINT genero_codigo_key UNIQUE (codigo);


--
-- Name: genero genero_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genero
    ADD CONSTRAINT genero_pkey PRIMARY KEY (id);


--
-- Name: gods gods_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gods
    ADD CONSTRAINT gods_name_key UNIQUE (name);


--
-- Name: gods gods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gods
    ADD CONSTRAINT gods_pkey PRIMARY KEY (id);


--
-- Name: indole indole_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.indole
    ADD CONSTRAINT indole_codigo_key UNIQUE (codigo);


--
-- Name: indole indole_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.indole
    ADD CONSTRAINT indole_pkey PRIMARY KEY (id);


--
-- Name: itens itens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.itens
    ADD CONSTRAINT itens_pkey PRIMARY KEY (id);


--
-- Name: level_progression level_progression_level_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.level_progression
    ADD CONSTRAINT level_progression_level_key UNIQUE (level);


--
-- Name: level_progression level_progression_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.level_progression
    ADD CONSTRAINT level_progression_pkey PRIMARY KEY (id);


--
-- Name: lore_notes lore_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lore_notes
    ADD CONSTRAINT lore_notes_pkey PRIMARY KEY (id);


--
-- Name: npc_acesso_player npc_acesso_player_npc_id_character_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.npc_acesso_player
    ADD CONSTRAINT npc_acesso_player_npc_id_character_id_key UNIQUE (npc_id, character_id);


--
-- Name: npc_acesso_player npc_acesso_player_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.npc_acesso_player
    ADD CONSTRAINT npc_acesso_player_pkey PRIMARY KEY (id);


--
-- Name: npcs npcs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.npcs
    ADD CONSTRAINT npcs_pkey PRIMARY KEY (id);


--
-- Name: passados passados_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.passados
    ADD CONSTRAINT passados_pkey PRIMARY KEY (id);


--
-- Name: pericias pericias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pericias
    ADD CONSTRAINT pericias_pkey PRIMARY KEY (id);


--
-- Name: player_telas player_telas_character_id_tela_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_telas
    ADD CONSTRAINT player_telas_character_id_tela_key UNIQUE (character_id, tela);


--
-- Name: player_telas player_telas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_telas
    ADD CONSTRAINT player_telas_pkey PRIMARY KEY (id);


--
-- Name: propriedade_arma propriedade_arma_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.propriedade_arma
    ADD CONSTRAINT propriedade_arma_pkey PRIMARY KEY (item);


--
-- Name: propriedade_armadura propriedade_armadura_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.propriedade_armadura
    ADD CONSTRAINT propriedade_armadura_pkey PRIMARY KEY (item);


--
-- Name: propriedade_equipamento propriedade_equipamento_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.propriedade_equipamento
    ADD CONSTRAINT propriedade_equipamento_pkey PRIMARY KEY (item);


--
-- Name: propriedade_variados propriedade_variados_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.propriedade_variados
    ADD CONSTRAINT propriedade_variados_pkey PRIMARY KEY (item);


--
-- Name: racas racas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.racas
    ADD CONSTRAINT racas_pkey PRIMARY KEY (id);


--
-- Name: raridade raridade_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.raridade
    ADD CONSTRAINT raridade_pkey PRIMARY KEY (item);


--
-- Name: receita_ingredientes receita_ingredientes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receita_ingredientes
    ADD CONSTRAINT receita_ingredientes_pkey PRIMARY KEY (id);


--
-- Name: receitas receitas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receitas
    ADD CONSTRAINT receitas_pkey PRIMARY KEY (id);


--
-- Name: regras_do_sistema regras_do_sistema_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regras_do_sistema
    ADD CONSTRAINT regras_do_sistema_pkey PRIMARY KEY (chave);


--
-- Name: skill_categoria skill_categoria_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_categoria
    ADD CONSTRAINT skill_categoria_pkey PRIMARY KEY (item);


--
-- Name: skill_character_override skill_character_override_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_character_override
    ADD CONSTRAINT skill_character_override_pkey PRIMARY KEY (id);


--
-- Name: skill_character_override skill_character_override_skill_name_character_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_character_override
    ADD CONSTRAINT skill_character_override_skill_name_character_id_key UNIQUE (skill_name, character_id);


--
-- Name: skill_natureza skill_natureza_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_natureza
    ADD CONSTRAINT skill_natureza_pkey PRIMARY KEY (item);


--
-- Name: skill_niveis skill_niveis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_niveis
    ADD CONSTRAINT skill_niveis_pkey PRIMARY KEY (id);


--
-- Name: skill_niveis skill_niveis_skill_id_nivel_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_niveis
    ADD CONSTRAINT skill_niveis_skill_id_nivel_key UNIQUE (skill_id, nivel);


--
-- Name: skill_tipo_dano skill_tipo_dano_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_tipo_dano
    ADD CONSTRAINT skill_tipo_dano_pkey PRIMARY KEY (item);


--
-- Name: skill_tipo skill_tipo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_tipo
    ADD CONSTRAINT skill_tipo_pkey PRIMARY KEY (item);


--
-- Name: skills skills_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_name_key UNIQUE (name);


--
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- Name: tipo_equipamento tipo_equipamento_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipo_equipamento
    ADD CONSTRAINT tipo_equipamento_pkey PRIMARY KEY (item);


--
-- Name: titles titles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.titles
    ADD CONSTRAINT titles_name_key UNIQUE (name);


--
-- Name: titles titles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.titles
    ADD CONSTRAINT titles_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: equipamentos_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX equipamentos_deleted_at_idx ON public.equipamentos USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: equipamentos_nome_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX equipamentos_nome_idx ON public.equipamentos USING btree (nome);


--
-- Name: idx_categoria_consumivel_descricao_ativa; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_categoria_consumivel_descricao_ativa ON public.categoria_consumivel USING btree (descricao) WHERE (deleted_at IS NULL);


--
-- Name: idx_categoria_equipamento_classe; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categoria_equipamento_classe ON public.categoria_equipamento USING btree (classe_item) WHERE ((classe_item IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: idx_categoria_item_descricao_ativa; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_categoria_item_descricao_ativa ON public.categoria_item USING btree (descricao) WHERE (deleted_at IS NULL);


--
-- Name: idx_ccr_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ccr_created_at ON public.character_creation_requests USING btree (created_at DESC);


--
-- Name: idx_ccr_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ccr_email ON public.character_creation_requests USING btree (email);


--
-- Name: idx_ccr_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ccr_status ON public.character_creation_requests USING btree (status) WHERE (deleted_at IS NULL);


--
-- Name: idx_ccr_username; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ccr_username ON public.character_creation_requests USING btree (username);


--
-- Name: idx_ccr_username_ativo; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_ccr_username_ativo ON public.character_creation_requests USING btree (username) WHERE ((deleted_at IS NULL) AND ((status)::text = ANY ((ARRAY['pendente'::character varying, 'aprovado'::character varying])::text[])));


--
-- Name: idx_character_creation_whitelist_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_character_creation_whitelist_created_at ON public.character_creation_whitelist USING btree (created_at DESC);


--
-- Name: idx_character_creation_whitelist_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_character_creation_whitelist_deleted_at ON public.character_creation_whitelist USING btree (deleted_at);


--
-- Name: idx_characters_data_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_characters_data_gin ON public.characters USING gin (data);


--
-- Name: idx_characters_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_characters_deleted_at ON public.characters USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: idx_characters_genero_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_characters_genero_id ON public.characters USING btree (genero_id);


--
-- Name: idx_characters_indole_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_characters_indole_id ON public.characters USING btree (indole_id);


--
-- Name: idx_characters_level; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_characters_level ON public.characters USING btree (level) WHERE (deleted_at IS NULL);


--
-- Name: idx_characters_name_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_characters_name_trgm ON public.characters USING gin (name public.gin_trgm_ops);


--
-- Name: idx_characters_pending_request; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_characters_pending_request ON public.characters USING btree (((data ? 'pendingChangeRequest'::text))) WHERE ((deleted_at IS NULL) AND (data ? 'pendingChangeRequest'::text));


--
-- Name: idx_characters_username; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_characters_username ON public.characters USING btree (username) WHERE (deleted_at IS NULL);


--
-- Name: idx_city_maps_created_at_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_city_maps_created_at_desc ON public.city_maps USING btree (created_at DESC) WHERE (deleted_at IS NULL);


--
-- Name: idx_city_maps_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_city_maps_deleted_at ON public.city_maps USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: idx_classe_marco_virtude_unico; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_classe_marco_virtude_unico ON public.classe_marco_virtude USING btree (classe_id, nivel);


--
-- Name: idx_classes_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_classes_deleted_at ON public.classes USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: idx_classes_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_classes_name ON public.classes USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_classes_tier; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_classes_tier ON public.classes USING btree (tier) WHERE (deleted_at IS NULL);


--
-- Name: idx_condicoes_nome_ativa; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_condicoes_nome_ativa ON public.condicoes USING btree (nome) WHERE (deleted_at IS NULL);


--
-- Name: idx_condicoes_raridade; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_condicoes_raridade ON public.condicoes USING btree (raridade_item) WHERE (deleted_at IS NULL);


--
-- Name: idx_consumiveis_ativos; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_consumiveis_ativos ON public.consumiveis USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: idx_consumiveis_categoria; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_consumiveis_categoria ON public.consumiveis USING btree (categoria_consumivel_item) WHERE (deleted_at IS NULL);


--
-- Name: idx_consumiveis_raridade; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_consumiveis_raridade ON public.consumiveis USING btree (raridade_item) WHERE (deleted_at IS NULL);


--
-- Name: idx_consumivel_condicao_condicao; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_consumivel_condicao_condicao ON public.consumivel_condicao USING btree (condicao_id);


--
-- Name: idx_consumivel_condicao_consumivel; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_consumivel_condicao_consumivel ON public.consumivel_condicao USING btree (consumivel_id);


--
-- Name: idx_consumivel_condicao_unico; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_consumivel_condicao_unico ON public.consumivel_condicao USING btree (consumivel_id, condicao_id, acao);


--
-- Name: idx_equipamentos_categoria_single; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipamentos_categoria_single ON public.equipamentos USING btree (categoria_equipamento_item) WHERE ((categoria_equipamento_item IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: idx_equipamentos_classe_array; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipamentos_classe_array ON public.equipamentos USING gin (classe_equipamento_item);


--
-- Name: idx_equipamentos_propriedade_item; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipamentos_propriedade_item ON public.equipamentos USING gin (propriedade_equipamento_item);


--
-- Name: idx_equipamentos_raridade; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipamentos_raridade ON public.equipamentos USING btree (raridade_item) WHERE (deleted_at IS NULL);


--
-- Name: idx_equipamentos_tipo_item; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipamentos_tipo_item ON public.equipamentos USING gin (tipo_equipamento_item);


--
-- Name: idx_gods_created_at_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gods_created_at_desc ON public.gods USING btree (created_at DESC) WHERE (deleted_at IS NULL);


--
-- Name: idx_gods_indole_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gods_indole_id ON public.gods USING btree (indole_id);


--
-- Name: idx_gods_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gods_name ON public.gods USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_itens_ativos; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_itens_ativos ON public.itens USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: idx_itens_categoria; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_itens_categoria ON public.itens USING btree (categoria_item) WHERE (deleted_at IS NULL);


--
-- Name: idx_itens_raridade; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_itens_raridade ON public.itens USING btree (raridade_item) WHERE (deleted_at IS NULL);


--
-- Name: idx_level_progression_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_level_progression_deleted_at ON public.level_progression USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: idx_level_progression_level; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_level_progression_level ON public.level_progression USING btree (level) WHERE (deleted_at IS NULL);


--
-- Name: idx_lore_notes_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lore_notes_active ON public.lore_notes USING btree (ordem, created_at) WHERE (deleted_at IS NULL);


--
-- Name: idx_lore_notes_character; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lore_notes_character ON public.lore_notes USING btree (character_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_pericias_nome_ativa; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_pericias_nome_ativa ON public.pericias USING btree (nome) WHERE (deleted_at IS NULL);


--
-- Name: idx_propriedade_equipamento_categoria; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_propriedade_equipamento_categoria ON public.propriedade_equipamento USING btree (categoria_item) WHERE (deleted_at IS NULL);


--
-- Name: idx_racas_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_racas_deleted_at ON public.racas USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: idx_raridade_descricao_ativa; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_raridade_descricao_ativa ON public.raridade USING btree (descricao) WHERE (deleted_at IS NULL);


--
-- Name: idx_receita_ingrediente_unico; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_receita_ingrediente_unico ON public.receita_ingredientes USING btree (receita_id, ingrediente_tabela, ingrediente_id);


--
-- Name: idx_receita_ingredientes_receita; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_receita_ingredientes_receita ON public.receita_ingredientes USING btree (receita_id);


--
-- Name: idx_receitas_produto; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_receitas_produto ON public.receitas USING btree (produto_tabela, produto_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_skills_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_skills_deleted_at ON public.skills USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: idx_skills_is_secret; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_skills_is_secret ON public.skills USING btree (is_secret) WHERE (deleted_at IS NULL);


--
-- Name: idx_tipo_equipamento_categoria; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tipo_equipamento_categoria ON public.tipo_equipamento USING btree (categoria_item) WHERE (deleted_at IS NULL);


--
-- Name: idx_titles_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_titles_deleted_at ON public.titles USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: idx_titles_is_hidden; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_titles_is_hidden ON public.titles USING btree (is_hidden) WHERE (deleted_at IS NULL);


--
-- Name: idx_titles_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_titles_name ON public.titles USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_titles_tier; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_titles_tier ON public.titles USING btree (tier) WHERE (deleted_at IS NULL);


--
-- Name: idx_titles_tier_hidden; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_titles_tier_hidden ON public.titles USING btree (tier, is_hidden) WHERE (deleted_at IS NULL);


--
-- Name: equipamentos equipamentos_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER equipamentos_set_updated_at BEFORE UPDATE ON public.equipamentos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: lore_notes set_lore_notes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_lore_notes_updated_at BEFORE UPDATE ON public.lore_notes FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: categoria_arma trg_categoria_arma_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_categoria_arma_updated_at BEFORE UPDATE ON public.categoria_arma FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: categoria_armadura trg_categoria_armadura_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_categoria_armadura_updated_at BEFORE UPDATE ON public.categoria_armadura FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: categoria_equipamento trg_categoria_equipamento_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_categoria_equipamento_updated_at BEFORE UPDATE ON public.categoria_equipamento FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: categoria_variados trg_categoria_variados_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_categoria_variados_updated_at BEFORE UPDATE ON public.categoria_variados FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: character_creation_requests trg_ccr_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_ccr_updated_at BEFORE UPDATE ON public.character_creation_requests FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: character_creation_whitelist trg_character_creation_whitelist_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_character_creation_whitelist_updated_at BEFORE UPDATE ON public.character_creation_whitelist FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: characters trg_characters_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_characters_updated_at BEFORE UPDATE ON public.characters FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: city_maps trg_city_maps_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_city_maps_updated_at BEFORE UPDATE ON public.city_maps FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: classe_arma trg_classe_arma_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_classe_arma_updated_at BEFORE UPDATE ON public.classe_arma FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: classe_armadura trg_classe_armadura_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_classe_armadura_updated_at BEFORE UPDATE ON public.classe_armadura FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: classe_equipamento trg_classe_equipamento_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_classe_equipamento_updated_at BEFORE UPDATE ON public.classe_equipamento FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: classe_variados trg_classe_variados_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_classe_variados_updated_at BEFORE UPDATE ON public.classe_variados FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: classes trg_classes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: uso_equipamento trg_equipamento_tipo_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_equipamento_tipo_updated_at BEFORE UPDATE ON public.uso_equipamento FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: equipamentos trg_equipamentos_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_equipamentos_updated_at BEFORE UPDATE ON public.equipamentos FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: gods trg_gods_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_gods_updated_at BEFORE UPDATE ON public.gods FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: lore_notes trg_lore_notes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_lore_notes_updated_at BEFORE UPDATE ON public.lore_notes FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: propriedade_arma trg_propriedade_arma_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_propriedade_arma_updated_at BEFORE UPDATE ON public.propriedade_arma FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: propriedade_armadura trg_propriedade_armadura_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_propriedade_armadura_updated_at BEFORE UPDATE ON public.propriedade_armadura FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: propriedade_equipamento trg_propriedade_equipamento_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_propriedade_equipamento_updated_at BEFORE UPDATE ON public.propriedade_equipamento FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: propriedade_variados trg_propriedade_variados_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_propriedade_variados_updated_at BEFORE UPDATE ON public.propriedade_variados FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: racas trg_racas_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_racas_updated_at BEFORE UPDATE ON public.racas FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: city_maps trg_set_updated_at_city_maps; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_updated_at_city_maps BEFORE UPDATE ON public.city_maps FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_city_maps();


--
-- Name: skill_categoria trg_skill_categoria_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_skill_categoria_updated_at BEFORE UPDATE ON public.skill_categoria FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: skill_tipo_dano trg_skill_tipo_dano_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_skill_tipo_dano_updated_at BEFORE UPDATE ON public.skill_tipo_dano FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: skill_tipo trg_skill_tipo_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_skill_tipo_updated_at BEFORE UPDATE ON public.skill_tipo FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: skills trg_skills_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_skills_updated_at BEFORE UPDATE ON public.skills FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: gods trg_sync_gods_image_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_gods_image_fields BEFORE INSERT OR UPDATE OF image_url, image_path ON public.gods FOR EACH ROW EXECUTE FUNCTION public.sync_gods_image_fields();


--
-- Name: tipo_equipamento trg_tipo_equipamento_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_tipo_equipamento_updated_at BEFORE UPDATE ON public.tipo_equipamento FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: titles trg_titles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_titles_updated_at BEFORE UPDATE ON public.titles FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: character_creation_whitelist trg_whitelist_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_whitelist_updated_at BEFORE UPDATE ON public.character_creation_whitelist FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();


--
-- Name: characters update_characters_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON public.characters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: level_progression Qualquer usuário pode consultar tabela de progressão; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Qualquer usuário pode consultar tabela de progressão" ON public.level_progression FOR SELECT USING (true);


--
-- Name: titles Qualquer usuário pode consultar títulos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Qualquer usuário pode consultar títulos" ON public.titles FOR SELECT USING (true);


--
-- Name: campaign_gms; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.campaign_gms ENABLE ROW LEVEL SECURITY;

--
-- Name: campaigns; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

--
-- Name: campaigns campanhas_select_public; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY campanhas_select_public ON public.campaigns FOR SELECT USING (((deleted_at IS NULL) AND (is_active = true)));


--
-- Name: categoria_arma; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categoria_arma ENABLE ROW LEVEL SECURITY;

--
-- Name: categoria_armadura; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categoria_armadura ENABLE ROW LEVEL SECURITY;

--
-- Name: categoria_equipamento; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categoria_equipamento ENABLE ROW LEVEL SECURITY;

--
-- Name: categoria_variados; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categoria_variados ENABLE ROW LEVEL SECURITY;

--
-- Name: character_creation_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.character_creation_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: character_creation_whitelist; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.character_creation_whitelist ENABLE ROW LEVEL SECURITY;

--
-- Name: city_maps; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.city_maps ENABLE ROW LEVEL SECURITY;

--
-- Name: class_level_progression; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.class_level_progression ENABLE ROW LEVEL SECURITY;

--
-- Name: classe_arma; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.classe_arma ENABLE ROW LEVEL SECURITY;

--
-- Name: classe_armadura; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.classe_armadura ENABLE ROW LEVEL SECURITY;

--
-- Name: classe_equipamento; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.classe_equipamento ENABLE ROW LEVEL SECURITY;

--
-- Name: classe_secreta_revelada; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.classe_secreta_revelada ENABLE ROW LEVEL SECURITY;

--
-- Name: classe_variados; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.classe_variados ENABLE ROW LEVEL SECURITY;

--
-- Name: classes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

--
-- Name: equipamentos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.equipamentos ENABLE ROW LEVEL SECURITY;

--
-- Name: equipamentos equipamentos_select_public; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY equipamentos_select_public ON public.equipamentos FOR SELECT USING ((deleted_at IS NULL));


--
-- Name: genero; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.genero ENABLE ROW LEVEL SECURITY;

--
-- Name: gods; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.gods ENABLE ROW LEVEL SECURITY;

--
-- Name: indole; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.indole ENABLE ROW LEVEL SECURITY;

--
-- Name: level_progression; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.level_progression ENABLE ROW LEVEL SECURITY;

--
-- Name: level_progression level_progression_select_public; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY level_progression_select_public ON public.level_progression FOR SELECT USING (true);


--
-- Name: lore_notes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lore_notes ENABLE ROW LEVEL SECURITY;

--
-- Name: npc_acesso_player; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.npc_acesso_player ENABLE ROW LEVEL SECURITY;

--
-- Name: npcs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.npcs ENABLE ROW LEVEL SECURITY;

--
-- Name: passados; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.passados ENABLE ROW LEVEL SECURITY;

--
-- Name: player_telas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.player_telas ENABLE ROW LEVEL SECURITY;

--
-- Name: propriedade_arma; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.propriedade_arma ENABLE ROW LEVEL SECURITY;

--
-- Name: propriedade_armadura; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.propriedade_armadura ENABLE ROW LEVEL SECURITY;

--
-- Name: propriedade_equipamento; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.propriedade_equipamento ENABLE ROW LEVEL SECURITY;

--
-- Name: propriedade_variados; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.propriedade_variados ENABLE ROW LEVEL SECURITY;

--
-- Name: racas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.racas ENABLE ROW LEVEL SECURITY;

--
-- Name: character_creation_whitelist service role full access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "service role full access" ON public.character_creation_whitelist USING ((app.current_user_role() = 'service_role'::text));


--
-- Name: skill_categoria; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.skill_categoria ENABLE ROW LEVEL SECURITY;

--
-- Name: skill_character_override; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.skill_character_override ENABLE ROW LEVEL SECURITY;

--
-- Name: skill_natureza; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.skill_natureza ENABLE ROW LEVEL SECURITY;

--
-- Name: skill_niveis; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.skill_niveis ENABLE ROW LEVEL SECURITY;

--
-- Name: skill_tipo; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.skill_tipo ENABLE ROW LEVEL SECURITY;

--
-- Name: skill_tipo_dano; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.skill_tipo_dano ENABLE ROW LEVEL SECURITY;

--
-- Name: skills; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

--
-- Name: tipo_equipamento; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tipo_equipamento ENABLE ROW LEVEL SECURITY;

--
-- Name: titles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.titles ENABLE ROW LEVEL SECURITY;

--
-- Name: uso_equipamento; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.uso_equipamento ENABLE ROW LEVEL SECURITY;

--
-- Name: usuarios; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict 1Egq2nUcmacTbuNr3MY4jvj6pauV30e6DVbopwUPW6ox47VMxq9kVcbPFGLQ20l

