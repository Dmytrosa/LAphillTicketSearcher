import express, { Request, Response } from 'express';
import { graphqlHTTP } from 'express-graphql';
import path from 'path';
import { schema } from './graphql/schema';
import { root } from './graphql/resolver';
import { PORT } from './miniState';
import { getSeatsInfo } from './controllers/seatsController';

const app = express();

// Ініціалізація ендпоїнту для GraphQL
app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true, // Set this to false to disable the GraphiQL UI in production
  })
);

//Обробка get запиту 
app.get('/', async (req: Request, res: Response) => {
  const id = req.query.id as string;

  if (!id) {
    const options = {
      root: path.join('./src/html/')
    };
    const fileName = 'index.html';
    res.sendFile(fileName, options);
    return;
  }

  try {
    // Виклик контролера для отримання інформації про місця
    const seatsInfo = await getSeatsInfo(req, res); // Передаємо req і res як аргументи у функцію getSeatsInfo
    res.json(seatsInfo);
  } catch (error: any) {
    console.error(error);
    res.status(error.response?.status || 500).json({ error: 'An error occurred while fetching data.' });
  }
});


//Відкриття порту
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
