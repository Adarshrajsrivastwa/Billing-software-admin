import { User } from "../models/User.js";

const DEFAULT_ADMIN = {
  username: "admin",
  email: "admin@gmail.com",
  password: "admin@9876",
  role: "admin",
};

export const seedDefaultAdmin = async () => {
  const exists = await User.findOne({ email: DEFAULT_ADMIN.email });

  if (exists) {
    console.log("Default admin already exists");
    return;
  }

  await User.create(DEFAULT_ADMIN);
  console.log(`Default admin created: ${DEFAULT_ADMIN.email}`);
};
