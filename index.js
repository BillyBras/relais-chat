import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import bcrypt from 'bcrypt';
import fs from 'fs';
import Joi from 'joi';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, { 
    cors: { origin: "*" } 
});

const DATA_FILE = './users.json';

const authSchema = Joi.object({
    pseudo: Joi.string().alphanum().min(3).max(15).required(),
    password: Joi.string().min(6).required(),
    action: Joi.string().valid('login', 'register').required()
});

const loadUsers = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) return {};
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(data || '{}');
    } catch (err) { return {}; }
};

const saveUsers = (users) => fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));

io.on('connection', (socket) => {
    console.log(`Nouvelle connexion : ${socket.id}`);

    socket.on('login', async (data) => {
        const { error, value } = authSchema.validate(data);
        if (error) return socket.emit('login-error', error.details[0].message);

        const { pseudo, password, action } = value;
        let users = loadUsers();

        if (action === 'register') {
            if (users[pseudo]) return socket.emit('login-error', 'Pseudo déjà pris.');
            const hash = await bcrypt.hash(password, 10);
            users[pseudo] = { password_hash: hash, createdAt: new Date().toISOString() };
            saveUsers(users);
            console.log(`Inscription réussie : ${pseudo}`);
            socket.emit('login-success', { pseudo });
        } else {
            const user = users[pseudo];
            if (!user || !(await bcrypt.compare(password, user.password_hash))) {
                return socket.emit('login-error', 'Identifiants incorrects.');
            }
            console.log(`Connexion réussie : ${pseudo}`);
            socket.emit('login-success', { pseudo });
        }
    });

    socket.on('send-msg', (data) => {
        io.emit('msg-in', data);
    });
});

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`--- SERVEUR DE CHAT EN LIGNE SUR LE PORT ${PORT} ---`);
});
