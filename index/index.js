const express = require("express");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log("MongoDB conectado");
});

mongoose.connection.on("error", (erro) => {
  console.error("ERRO MONGODB:");
  console.error(erro);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB desconectado");
});

const corridaSchema = new mongoose.Schema(
  {
    id: Number,

    distancia: Number,

    tempo: Number,

    ritmoMedio: String
  },
  {
    versionKey: false
  }
);

const Corrida = mongoose.model("Corrida", corridaSchema);

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "API de Corridas",
    version: "1.0.0",
    description: "Documentação da API de treinos de corrida"
  },
  paths: {
    "/corridas": {
      get: {
        summary: "Listar todas as corridas",
        responses: {
          200: {
            description: "Lista de corridas"
          }
        }
      },
      post: {
        summary: "Cadastrar uma corrida",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  distancia: {
                    type: "number",
                    example: 5,
                    description: "Distância em km"
                  },
                  tempo: {
                    type: "number",
                    example: 30,
                    descripition: "Tempo em minutos"
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: "Corrida cadastrada com sucesso"
          }
        }
      }
    },

    "/corridas/{id}": {
      get: {
        summary: "Buscar corrida pelo ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "number"
            },
            example: 1
          }
        ],
        responses: {
          200: {
            description: "Corrida encontrada"
          },
          404: {
            description: "Corrida não encontrada"
          }
        }
      },

      put: {
        summary: "Atualizar uma corrida",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "number"
            },
            example: 1
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  distancia: {
                    type: "number",
                    example: 10
                  },
                  tempo: {
                    type: "number",
                    example: 50
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Corrida atualizada"
          },
          404: {
            description: "Corrida não encontrada"
          }
        }
      },

      delete: {
        summary: "Deletar uma corrida",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "number"
            },
            example: 1
          }
        ],
        responses: {
          200: {
            description: "Corrida deletada"
          },
          404: {
            description: "Corrida não encontrada"
          }
        }
      }
    }
  }
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req, res) => {
  res.send("API de Corridas funcionando");
});

app.get("/corridas/:id", async (req, res) => {
  
  const corrida = await Corrida.findOne(
    { id: Number(req.params.id) },
    { _id: 0 }
  );

  if (!corrida) {
    return res.status(404).json({
      mensagem: "Corrida não encontrada"
    });
  }

  res.json({
  id: corrida.id,
  distancia: `${corrida.distancia} km`,
  tempo: `${corrida.tempo} minutos`,
  ritmoMedio: corrida.ritmoMedio
});
});
app.get("/corridas", async (req, res) => {
  try {
    const corridas = await Corrida.find({}, { _id: 0 });

    res.json(corridas);
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: erro.message
    });
  }
});
app.post("/corridas", async (req, res) => {
  try {
    const quantidade = await Corrida.countDocuments();

    const distancia = Number(req.body.distancia);
    const tempo = Number(req.body.tempo);

    const ritmo = (tempo / distancia).toFixed(2);

    const novaCorrida = await Corrida.create({
      id: quantidade + 1,
      distancia,
      tempo,
      ritmoMedio: `${ritmo} min/km`
    });

    res.status(201).json({
      id: novaCorrida.id,
      distancia: `${novaCorrida.distancia} km`,
      tempo: `${novaCorrida.tempo} minutos`,
      ritmoMedio: novaCorrida.ritmoMedio
    });

  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      erro: erro.message
    });
  }
});

app.put("/corridas/:id", async (req, res) => {
  const distancia = Number(req.body.distancia);
  const tempo = Number(req.body.tempo);
  const ritmo = (tempo / distancia).toFixed(2);

  const corridaAtualizada = await Corrida.findOneAndUpdate(
    { id: Number(req.params.id) },
    {
      distancia,
      tempo,
      ritmoMedio: `${ritmo} min/km`
    },
    { new: true }
  );

  if (!corridaAtualizada) {
    return res.status(404).json({
      mensagem: "Corrida não encontrada"
    });
  }

 res.json({
  id: corridaAtualizada.id,
  distancia: `${corridaAtualizada.distancia} km`,
  tempo: `${corridaAtualizada.tempo} minutos`,
  ritmoMedio: corridaAtualizada.ritmoMedio
});
});

app.delete("/corridas/:id", async (req, res) => {

  const corridaRemovida = await Corrida.findOneAndDelete({
    id: Number(req.params.id)
  });

  if (!corridaRemovida) {
    return res.status(404).json({
      mensagem: "Corrida não encontrada"
    });
  }

  res.json({
    mensagem: "Corrida removida com sucesso"
  });
});

if (process.env.NODE_ENV !== "production") {
  app.listen(3000, () => {
    console.log("Servidor iniciado em http://localhost:3000");
  });
}

module.exports = app;