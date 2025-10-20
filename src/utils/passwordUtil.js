import bcrypt from 'bcrypt';

export const hashPassword = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const comparePassword = (password, hashedPassword) => bcrypt.compareSync(password, hashedPassword);