const Pokedex = require('pokedex-promise-v2');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 7890;
var P = new Pokedex();

app.use(
  cors({
    origin: '*',
  })
);

const updatedPokemon = {};
app.get('/api/v2/pokemon/:nameOrId', async (req, res) => {
  try {
    const response = await P.getPokemonByName(req.params.nameOrId);
    if (updatedPokemon[response.id]) {
      return res.send(updatedPokemon[response.id]);
    }
    res.send(response);
  } catch (e) {
    res.send(e);
  }
});

app.post('/api/v2/pokemon/:nameOrId', async (req, res) => {
  try {
    const response = await P.getPokemonByName(req.params.nameOrId);
    const local = updatedPokemon[response.id] || {};
    const newState = {
      ...response,
      ...local,
      ...req.body,
    };
    updatedPokemon[response.id] = newState;
    updatedPokemon[response.name] = newState;
    return res.send({ ok: true });
  } catch (e) {
    res.send({ error: e });
  }
});

app.get('/api/v2/pokemon/paged/:page/:pageSize', async (req, res) => {
  try {
    const page = parseInt(req.params.page);
    const pageSize = parseInt(req.params.pageSize);
    const interval = {
      limit: pageSize - 1,
      offset: pageSize * page + 1,
    };
    const { results } = await P.getPokemonsList(interval);
    const pokemonList = await Promise.all(
      results.map(({ name }) => {
        if (updatedPokemon[name]) {
          return Promise.resolve(updatedPokemon[name]);
        }

        return P.getPokemonByName(name);
      })
    );
    return res.send(pokemonList);
  } catch (e) {
    res.send({ error: e });
  }
});

app.listen(port, () => {
  console.log(`Pokemon API listening at http://localhost:${port}`);
});
