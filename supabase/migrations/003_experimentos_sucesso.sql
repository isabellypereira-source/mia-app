-- Tabela para armazenar experimentos bem-sucedidos
CREATE TABLE experimentos_sucesso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formulacao_id UUID NOT NULL REFERENCES formulacoes(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL,

  -- Entrada (formula + STL params)
  ingredientes JSONB NOT NULL,
  parametros_impressao JSONB,
  forma VARCHAR(50),
  densidade FLOAT,
  altura_mm INT,
  diametro_mm INT,

  -- Saída (qualidade e resistência)
  qualidade_geometrica FLOAT, -- 0-100 (acurácia)
  resistencia_mecanica FLOAT, -- MPa (opcional)
  aparencia_score INT, -- 1-10
  observacoes TEXT,

  -- Arquivo G-code
  gcode_url VARCHAR(500),
  gcode_filename VARCHAR(255),

  -- Timestamp
  data_impressao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Flag para ML
  feito_treinar_mia BOOLEAN DEFAULT FALSE,
  versao_modelo VARCHAR(50),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para descoberta de patterns
CREATE INDEX idx_experimentos_qualidade ON experimentos_sucesso(qualidade_geometrica DESC)
  WHERE qualidade_geometrica > 80;

CREATE INDEX idx_experimentos_ingredientes ON experimentos_sucesso USING GIN(ingredientes);

CREATE INDEX idx_experimentos_usuario ON experimentos_sucesso(usuario_id);

CREATE INDEX idx_experimentos_formulacao ON experimentos_sucesso(formulacao_id);

CREATE INDEX idx_experimentos_treino ON experimentos_sucesso(feito_treinar_mia, created_at)
  WHERE feito_treinar_mia = FALSE;

-- Enable RLS
ALTER TABLE experimentos_sucesso ENABLE ROW LEVEL SECURITY;

-- Policy: usuários veem apenas seus próprios experimentos
CREATE POLICY "Users can view their own experiments"
  ON experimentos_sucesso
  FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert their own experiments"
  ON experimentos_sucesso
  FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own experiments"
  ON experimentos_sucesso
  FOR UPDATE
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);
