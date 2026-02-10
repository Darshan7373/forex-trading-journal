--
-- PostgreSQL database dump
--

\restrict Y2cOVUt7XCJPuOsZyib6rsrUE2X8LHJR3SvAui0eMfyi8YyNVRd7fPIBdmWJqpr

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

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
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: trades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trades (
    id integer NOT NULL,
    user_id integer NOT NULL,
    date timestamp without time zone NOT NULL,
    session character varying(20) NOT NULL,
    currency_pair character varying(10) NOT NULL,
    timeframe character varying(5) NOT NULL,
    direction character varying(10) NOT NULL,
    entry_price numeric(12,5) NOT NULL,
    stop_loss numeric(12,5) NOT NULL,
    take_profit numeric(12,5) NOT NULL,
    lot_size numeric(10,2) NOT NULL,
    risk_percentage numeric(4,2) NOT NULL,
    rr_ratio numeric(10,2) NOT NULL,
    strategy_name character varying(100) NOT NULL,
    outcome character varying(10) NOT NULL,
    pips numeric(10,2) NOT NULL,
    notes text DEFAULT ''::text,
    emotions_before character varying(500) DEFAULT ''::character varying,
    emotions_during character varying(500) DEFAULT ''::character varying,
    emotions_after character varying(500) DEFAULT ''::character varying,
    ai_feedback jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT trades_direction_check CHECK (((direction)::text = ANY ((ARRAY['Buy'::character varying, 'Sell'::character varying])::text[]))),
    CONSTRAINT trades_entry_price_check CHECK ((entry_price > (0)::numeric)),
    CONSTRAINT trades_lot_size_check CHECK ((lot_size >= 0.01)),
    CONSTRAINT trades_outcome_check CHECK (((outcome)::text = ANY ((ARRAY['Win'::character varying, 'Loss'::character varying, 'BE'::character varying])::text[]))),
    CONSTRAINT trades_risk_percentage_check CHECK (((risk_percentage >= 0.1) AND (risk_percentage <= (10)::numeric))),
    CONSTRAINT trades_rr_ratio_check CHECK ((rr_ratio >= 0.1)),
    CONSTRAINT trades_session_check CHECK (((session)::text = ANY ((ARRAY['London'::character varying, 'NY'::character varying, 'Asia'::character varying, 'Sydney'::character varying])::text[]))),
    CONSTRAINT trades_stop_loss_check CHECK ((stop_loss > (0)::numeric)),
    CONSTRAINT trades_take_profit_check CHECK ((take_profit > (0)::numeric)),
    CONSTRAINT trades_timeframe_check CHECK (((timeframe)::text = ANY ((ARRAY['M1'::character varying, 'M5'::character varying, 'M15'::character varying, 'M30'::character varying, 'H1'::character varying, 'H4'::character varying, 'D1'::character varying, 'W1'::character varying, 'MN'::character varying])::text[])))
);


ALTER TABLE public.trades OWNER TO postgres;

--
-- Name: session_performance; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.session_performance AS
 SELECT user_id,
    session,
    count(*) AS total_trades,
    count(
        CASE
            WHEN ((outcome)::text = 'Win'::text) THEN 1
            ELSE NULL::integer
        END) AS wins,
    sum(pips) AS total_pips
   FROM public.trades
  GROUP BY user_id, session;


ALTER VIEW public.session_performance OWNER TO postgres;

--
-- Name: strategy_performance; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.strategy_performance AS
 SELECT user_id,
    strategy_name,
    count(*) AS total_trades,
    count(
        CASE
            WHEN ((outcome)::text = 'Win'::text) THEN 1
            ELSE NULL::integer
        END) AS wins,
    sum(pips) AS total_pips,
    avg(rr_ratio) AS avg_rr_ratio
   FROM public.trades
  GROUP BY user_id, strategy_name;


ALTER VIEW public.strategy_performance OWNER TO postgres;

--
-- Name: trades_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trades_id_seq OWNER TO postgres;

--
-- Name: trades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trades_id_seq OWNED BY public.trades.id;


--
-- Name: user_trading_stats; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.user_trading_stats AS
 SELECT user_id,
    count(*) AS total_trades,
    count(
        CASE
            WHEN ((outcome)::text = 'Win'::text) THEN 1
            ELSE NULL::integer
        END) AS wins,
    count(
        CASE
            WHEN ((outcome)::text = 'Loss'::text) THEN 1
            ELSE NULL::integer
        END) AS losses,
    count(
        CASE
            WHEN ((outcome)::text = 'BE'::text) THEN 1
            ELSE NULL::integer
        END) AS break_evens,
    sum(pips) AS net_pips,
    avg(rr_ratio) AS avg_rr_ratio,
    avg(risk_percentage) AS avg_risk_percentage,
    avg(
        CASE
            WHEN (ai_feedback IS NOT NULL) THEN ((ai_feedback ->> 'executionScore'::text))::integer
            ELSE NULL::integer
        END) AS avg_execution_score
   FROM public.trades
  GROUP BY user_id;


ALTER VIEW public.user_trading_stats OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    default_risk_percentage numeric(4,2) DEFAULT 1.00,
    trading_goals text DEFAULT ''::text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_default_risk_percentage_check CHECK (((default_risk_percentage >= 0.1) AND (default_risk_percentage <= (10)::numeric)))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: trades id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trades ALTER COLUMN id SET DEFAULT nextval('public.trades_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: trades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trades (id, user_id, date, session, currency_pair, timeframe, direction, entry_price, stop_loss, take_profit, lot_size, risk_percentage, rr_ratio, strategy_name, outcome, pips, notes, emotions_before, emotions_during, emotions_after, ai_feedback, created_at, updated_at) FROM stdin;
6	1	2026-02-10 00:00:00	London	EUR/USD	H1	Buy	1.19055	1.18963	1.19247	0.30	1.00	2.09	ema	Win	19.00	fbzfb				{"mistakes": [], "patterns": ["good_discipline"], "strengths": ["Good risk-to-reward ratio", "Conservative position sizing", "Maintained emotional discipline", "Proper risk management with SL/TP"], "analyzedAt": "2026-02-10T05:19:20.827Z", "suggestion": "Excellent trade! Document what made this setup high-probability and repeat it.", "emotionalState": "mixed", "executionScore": 9, "riskAssessment": "excellent"}	2026-02-10 10:49:20.828654	2026-02-10 10:49:20.828654
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, name, default_risk_percentage, trading_goals, created_at, updated_at) FROM stdin;
1	kambariyadarshan22@gmail.com	$2a$10$dGgWiWZImasov2CCu.6WD.85IsIKO8pIX3H6zvH13Sm8dtB6oE3HW	Darshan kambariya	1.00		2026-02-10 10:22:09.267346	2026-02-10 10:22:09.267346
\.


--
-- Name: trades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trades_id_seq', 6, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: trades trades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT trades_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_trades_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trades_date ON public.trades USING btree (date);


--
-- Name: idx_trades_user_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trades_user_date ON public.trades USING btree (user_id, date DESC);


--
-- Name: idx_trades_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trades_user_id ON public.trades USING btree (user_id);


--
-- Name: idx_trades_user_outcome; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trades_user_outcome ON public.trades USING btree (user_id, outcome);


--
-- Name: idx_trades_user_session; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trades_user_session ON public.trades USING btree (user_id, session);


--
-- Name: idx_trades_user_strategy; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trades_user_strategy ON public.trades USING btree (user_id, strategy_name);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: trades update_trades_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON public.trades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: trades trades_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT trades_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Y2cOVUt7XCJPuOsZyib6rsrUE2X8LHJR3SvAui0eMfyi8YyNVRd7fPIBdmWJqpr

