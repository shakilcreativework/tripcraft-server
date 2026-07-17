"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongodb_1 = require("mongodb");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/tripcraft';
app.use((0, cors_1.default)());
app.use(express_1.default.json());
let db;
mongodb_1.MongoClient.connect(mongoUrl)
    .then((client) => {
    db = client.db();
    console.log('Connected to MongoDB');
})
    .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
});
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=index.js.map