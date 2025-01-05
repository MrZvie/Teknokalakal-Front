import { mongooseConnect } from "@/lib/mongoose";
import { User } from "@/models/User";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, password, username } = req.body;

  try {
    await mongooseConnect();
  
    const existingUser = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });
  
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
  
    if (existingUsername) {
      return res.status(400).json({ message: "Username is already taken" });
    }
  
    const newUser = new User({
      name,
      email,
      username,
      password,
      role: "user",
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
