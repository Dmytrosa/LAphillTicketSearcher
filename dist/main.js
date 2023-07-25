"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_graphql_1 = require("express-graphql");
const path_1 = __importDefault(require("path"));
const schema_1 = require("./graphql/schema");
const resolver_1 = require("./graphql/resolver");
const miniState_1 = require("./miniState");
const seatsController_1 = require("./controllers/seatsController");
const app = (0, express_1.default)();
// Ініціалізація ендпоїнту для GraphQL
app.use('/graphql', (0, express_graphql_1.graphqlHTTP)({
    schema: schema_1.schema,
    rootValue: resolver_1.root,
    graphiql: true, // Set this to false to disable the GraphiQL UI in production
}));
//Обробка get запиту 
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = req.query.id;
    if (!id) {
        const options = {
            root: path_1.default.join('./src/html/')
        };
        const fileName = 'index.html';
        res.sendFile(fileName, options);
        return;
    }
    try {
        // Виклик контролера для отримання інформації про місця
        const seatsInfo = yield (0, seatsController_1.getSeatsInfo)(req, res); // Передаємо req і res як аргументи у функцію getSeatsInfo
        res.json(seatsInfo);
    }
    catch (error) {
        console.error(error);
        res.status(((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || 500).json({ error: 'An error occurred while fetching data.' });
    }
}));
//Відкриття порту
app.listen(miniState_1.PORT, () => {
    console.log(`Server is running on http://localhost:${miniState_1.PORT}`);
});
