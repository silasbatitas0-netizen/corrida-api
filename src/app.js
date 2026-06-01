const express = require("express");
const swaggerUi = require("swagger-ui-express");

const app = express();
const PORT = 4000;

app.use(express.json());

let corridas = [];

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "API de Corridas",
    version: "1.0.0",
    description: "API simples de treino de corrida"
  },
  paths: {
    "/corridas": {
      get: {
        summary: "Listar corridas",
        responses: {
          200: {
            description: "Lista de corridas"
          }
        }
      },
      post: {
        summary: "Cadastrar corrida",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  atleta: {
                    type: "string"
                  },
                  distancia: {
                    type: "string"
                  },
                  tempo: {
                    type: "string"
                  },
                  data: {
                    type: "string"
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: "Corrida cadastrada"
          }
        }
      }
    }
  }
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/teste", (req, res) => {
  res.send("Funcionando");
});

app.get("/corridas", (req, res) => {
  res.json(corridas);
});

app.post("/corridas", (req, res) => {
  const novaCorrida = {
    id: corridas.length + 1,
    atleta: req.body.atleta,
    distancia: req.body.distancia,
    tempo: req.body.tempo,
    data: req.body.data
  };

  corridas.push(novaCorrida);

  res.status(201).json(novaCorrida);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});