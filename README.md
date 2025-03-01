# GPT Backend

## Descrição

Este projeto é um backend para sincronização de estrutura de banco de dados utilizando OpenAI. O sistema permite a sincronização automática do esquema de banco de dados MariaDB com base em diagramas ER (Entidade-Relacionamento).

## Pré-requisitos

- Node.js v14 ou superior
- MariaDB/MySQL
- NPM ou Yarn
- Conta na OpenAI com chave de API válida

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/lucasreno/gpt-be.git
   cd gpt-be
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente copiando o arquivo `.env` de exemplo e ajustando conforme necessário:
   ```bash
   cp .env.example .env
   ```

## Configuração

Edite o arquivo `.env` com suas configurações:

```properties
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua-senha
DB_DATABASE=gpt
OPENAI_API_KEY=sua-chave-api-openai
```

> ⚠️ **Importante**: É necessário configurar a chave de API da OpenAI (`OPENAI_API_KEY`) nas variáveis de ambiente para que o sistema funcione corretamente. Obtenha sua chave em https://platform.openai.com/api-keys.

## Como executar

Para iniciar o servidor em modo desenvolvimento:

```bash
npm start
```

## Estrutura do Projeto

```
/c:/oneway/gpt-be/
│
├── config/               # Configurações do projeto
├── db/                   # Camada de acesso ao banco de dados
│   └── database.js       # Funções de conexão e consulta ao banco
├── services/             # Serviços da aplicação
│   ├── dbSyncService.js  # Serviço de sincronização de estrutura do banco
│   └── openaiService.js  # Serviço de integração com a OpenAI
├── utils/                # Utilitários
│   ├── fileHelpers.js    # Auxiliares para manipulação de arquivos
│   └── logger.js         # Sistema de log
├── routes/               # Rotas da API
│   └── index.js          # Definição das rotas
├── erDiagram             # Arquivo de diagrama ER para sincronização
├── server.js             # Ponto de entrada da aplicação
├── .env                  # Variáveis de ambiente (não versionado)
├── .gitignore            # Arquivos ignorados pelo Git
└── README.md             # Documentação do projeto
```

## Funcionalidades

- Sincronização automática da estrutura do banco de dados baseada em diagramas ER
- Integração com a API OpenAI para interpretação inteligente dos diagramas
- Sistema de logs para monitoramento das operações
- API RESTful para interação com o sistema

## Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).
