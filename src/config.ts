

export const Config = () => {
  if (process.env.JWT_SECRET === undefined) {
    console.warn(
      "JWT_SECRET is not set, using default secret. This is not secure for production!"
    );
    throw new Error("JWT_SECRET is required");
  }

  if (process.env.MYSQL_CONNECTION_STRING === undefined) {
    console.warn(
      "MYSQL_CONNECTION_STRING is not set, using default connection string. This is not secure for production!"
    );
    throw new Error("MYSQL_CONNECTION_STRING is required");
  }

  if (process.env.PASSWORD_SALT === undefined) {
    console.warn(
      "PASSWORD_SALT is not set, using default salt. This is not secure for production!"
    );
    throw new Error("PASSWORD_SALT is required");
  }

  if (process.env.PASSWORD_HASH_ALGORITHM === undefined) {
    console.warn(
      "PASSWORD_HASH_ALGORITHM is not set, using default algorithm. This is not secure for production!"
    );
    throw new Error("PASSWORD_HASH_ALGORITHM is required");
  }

  return {
    get: () => ({
      jwtSecret: process.env.JWT_SECRET!,
      mysqlConnectionString: process.env.MYSQL_CONNECTION_STRING!,
      passwordSalt: process.env.PASSWORD_SALT!,
      passwordHashAlgorithm: process.env.PASSWORD_HASH_ALGORITHM!,
      appPort: parseInt(process.env.APP_PORT || "3000", 10),
    }),
  };
};
