import jwt from 'jsonwebtoken';
import client from '../client';

export const getUser = async (token) => {
  try {
    if (!token) {
      return null;
    }
    const { id } = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await client.user.findUnique({
      where: {
        id,
      },
    });
    if (user) {
      return user;
    } else {
      return null;
    }
  } catch {
    return null;
  }
};

export function protectResolver(ourResolver) {
  return function (root, args, context, info) {
    return {
      ok: false,
      error: 'Please logged in',
    };
  };
}
