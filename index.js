import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

const mongoURI = process.env.MONGODB_URL;
mongoose.connect(mongoURI)
    .then(() => console.log("✅ Connecté à MongoDB Cloud"))
    .catch(err => console.error("❌ Erreur de connexion MongoDB:", err));

const User = mongoose.model('User', new mongoose.Schema({
    pseudo: { type: String, unique: true, required: true },
    password_hash: { type: String, required: true }
}));

io.on('connection', (socket) => {
    socket.on('login', async (data) => {
        const { pseudo, password, action } = data;
        
        if (action === 'register') {
            try {
                const hash = await bcrypt.hash(password, 10);
                const newUser = new User({ pseudo, password_hash: hash });
                await newUser.save();
                socket.emit('login-success', { pseudo });
                console.log(`Nouvelle inscription : ${pseudo}`);
            } catch (e) {
                socket.emit('login-error', 'Pseudo déjà utilisé.');
            }
        } else {
            const user = await User.findOne({ pseudo });
            if (user && await bcrypt.compare(password, user.password_hash)) {
                socket.emit('login-success', { pseudo });
            } else {
                socket.emit('login-error', 'Mauvais identifiants.');
            }
        }
    });

    socket.on('send-msg', (data) => io.emit('msg-in', data));
});

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, '0.0.0.0', () => console.log(`Serveur Cloud actif sur port ${PORT}`));
