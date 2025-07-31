import { User, UserRole } from "../../../database/entities/user.entity.js";
import { getDB } from "../../../database/init.js";
import { NotFoundError } from "../../../utils/errors/notfound.error.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Asynchronously creates a new user in the database using the provided information.
 * @async
 * @param {Pick<User, "firebaseUID" | "name" | "email">} user - Object containing the user's Firebase UID, name, and email.
 * @returns {Promise<User>} A promise that resolves to the newly created user entity.
 */
export const createUser = async (
  user: Pick<User, "firebaseUID" | "name" | "email">,
): Promise<User> => {
  const db = await getDB();
  const dbUser = db.create(User, {
    firebaseUID: user.firebaseUID,
    id: uuidv4(),
    name: user.name,
    email: user.email,
    role: UserRole.USER,
  });
  await db.flush();
  return dbUser;
};

/**
 * Retrieves a user from the database based on the provided user ID.
 *
 * @param {string} userId - The unique identifier of the user to be retrieved.
 * @returns {Promise<User>} A promise that resolves with the user object if found.
 * @throws {NotFoundError} If no user is found with the specified ID.
 */
export const getUser = async (userId: string): Promise<User> => {
  const db = await getDB();
  const user = await db.findOne(User, {
    id: userId,
  });

  if (!user) {
    throw new NotFoundError(`User with id ${userId} not found`);
  }
  return user;
};
