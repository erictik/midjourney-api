import User from '../models/user.model';
import express from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuid4 } from 'uuid';

const router = express.Router();

router.post("/login", async (req: any, res: any) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });

        if (!user) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }

        const token = user.token;

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: "Error logging in" });
    }
});


// router.post("/register", async (req: any, res: any) => {
//     const { username, password } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);

//     try {
//         const user = new User({ username, password: hashedPassword, token: uuid4() });
//         await user.save();
//         res.status(201).json({ message: "User registered successfully" });
//     } catch (error) {
//         res.status(500).json({ message: "Error registering user" });
//     }
// });


export default router;