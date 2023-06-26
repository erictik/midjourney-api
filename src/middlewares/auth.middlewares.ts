import User from '../models/user.model';

export async function authenticateToken(req: any, res: any, next: any) {
    const token = req.headers.authorization;

    if (!token) {
        res.status(401).json({ message: "Authentication token missing" });
        return;
    }

    const user = await User.findOne({ token: token });
    if (user) {
        req.user = user;
        next();
    } else {
        console.log(token)
        console.log(user)
        res.status(403).json({ message: "Invalid token" });
        return;
    }

}
