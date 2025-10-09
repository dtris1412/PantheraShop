import db from "../models/index.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$/; // ít nhất 6 ký tự, gồm chữ hoa, chữ thường, số
const phoneRegex = /^(0|\+84)[0-9]{9,10}$/; // cho phép 0xxxx hoặc +84xxxx

const getAllUsers = async () => {
  return await db.User.findAll();
};

const getUserById = async (user_id) => {
  if (!user_id) return null;
  const user = await db.User.findOne({ where: { user_id } });
  if (!user) return;
  return user;
};

const createUser = async (
  user_name,
  user_email,
  user_password,
  user_phone,
  role_id,
  avatar
) => {
  //khong nhap du du lieu
  if (!user_name || !user_email || !user_password || !user_phone) {
    return { succes: false, message: "Please enter all required information" };
  }
  //check email correct
  if (!emailRegex.test(user_email))
    return { succes: false, message: "Email is incorrect format" };
  if (!phoneRegex.test(user_phone))
    return { succes: false, message: "Number phone is in correct format" };
  if (!passwordRegex.test(user_password))
    return { succes: false, message: "Password is incorrect format" };

  //check existed
  const existedUser = await db.User.findOne({
    where: [{ user_email }, { user_name }],
  });

  if (existedUser)
    return { succes: false, message: "Email or username is already" };
  //craete user

  const newUser = await db.User.craete(
    user_name,
    user_email,
    user_password,
    user_phone,
    role_id || 2,
    avatar || null
  );

  return { succes: false, message: "Create new user succesful" };
};
export { getAllUsers, getUserById };
