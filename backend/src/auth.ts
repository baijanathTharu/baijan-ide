import {
  ISignUpHandler,
  ILoginHandler,
  ILogoutHandler,
  IRefreshHandler,
  IResetPasswordHandler,
  IMeRouteHandler,
  IVerifyEmailHandler,
  IForgotPasswordHandler,
  ISendOtpHandler,
} from "@baijanstack/express-auth";
import { prisma } from "./prisma-client";

export type TUser = {
  name: string;
  email: string;
  password: string;
  is_email_verified: boolean;
  UserOtp: {
    id: string;
    user_id: string;
    code: string;
    is_used: boolean;
    generated_at: Date;
    created: Date;
  }[];
};

const users: TUser[] = [];

type TEmailObj = {
  email: string;
};
interface TSignUpBodyInput extends TEmailObj {
  name: string;
  password: string;
}
export class SignUpHandler implements ISignUpHandler {
  constructor() {
    console.log("signup persistor init...");
  }

  errors: { USER_ALREADY_EXISTS_MESSAGE?: string } = {};

  doesUserExists: (body: TSignUpBodyInput) => Promise<boolean> = async (
    body
  ) => {
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
    return !!user;
  };

  saveUser: (body: TSignUpBodyInput, hashedPassword: string) => Promise<void> =
    async (body, hashedPassword) => {
      await prisma.user.create({
        data: {
          name: body.name,
          email: body.email,
          password: hashedPassword,
        },
      });
    };
}

export class LoginHandler implements ILoginHandler {
  getUserByEmail: (email: string) => Promise<TUser | null> = async (email) => {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        UserOtp: true,
      },
    });
    if (!user) {
      return null;
    }
    return user;
  };
  errors: { PASSWORD_OR_EMAIL_INCORRECT?: string } = {
    PASSWORD_OR_EMAIL_INCORRECT: "Password or email incorrect",
  };

  getTokenPayload: (email: string) => Promise<{
    name: string;
    email: string;
  } | null> = async (email) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      email: user?.email,
      name: user?.name,
    };
  };
}

export class LogoutHandler implements ILogoutHandler {
  shouldLogout: () => Promise<boolean> = async () => {
    return true;
  };
}

export class RefreshHandler implements IRefreshHandler {
  errors: { INVALID_REFRESH_TOKEN?: string } = {};

  refresh: (token: string) => Promise<void> = async () => {
    console.log("refreshing token...");
  };

  getTokenPayload: (email: string) => Promise<{
    name: string;
    email: string;
  } | null> = async (email) => {
    console.log("getTokenPayload", email);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      email: user?.email,
      name: user?.name,
    };
  };
}

export class ResetPasswordHandler implements IResetPasswordHandler {
  saveHashedPassword: (email: string, hashedPassword: string) => Promise<void> =
    async (email, hashedPassword) => {
      await prisma.user.update({
        where: {
          email,
        },
        data: {
          password: hashedPassword,
        },
      });
    };
  getOldPasswordHash: (email: string) => Promise<string> = async (email) => {
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (!user) {
      throw new Error(`User not found`);
    }

    return user.password;
  };
}

export class MeRouteHandler implements IMeRouteHandler {
  getMeByEmail: (
    email: string
  ) => Promise<{ email: string; name: string } | null> = async (email) => {
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (!user) {
      throw new Error(`User not found`);
    }

    return {
      email: user.email,
      name: user.name,
    };
  };
}

export class VerifyEmailHandler implements IVerifyEmailHandler {
  isOtpValid: (email: string, otp: string) => Promise<boolean> = async (
    email,
    otp
  ) => {
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });
    console.log("user", user);
    if (!user) {
      return false;
    }
    const otps = await prisma.userOtp.findMany();
    const total = await prisma.userOtp.count();
    const lastOtp = otps[total - 1];

    const isOtpMatched = lastOtp.code === otp;

    const isExpired =
      lastOtp?.generated_at.getTime() < Date.now() / 1000 - 60 * 5; // 5 minutes

    return isOtpMatched && !isExpired;
  };

  isEmailAlreadyVerified: (email: string) => Promise<boolean> = async (
    email
  ) => {
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });
    return !user?.is_email_verified;
  };
}

export class SendOtpHandler implements ISendOtpHandler {
  doesUserExists: (email: string) => Promise<boolean> = async (email) => {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    return !!user;
  };

  saveOtp: (
    email: string,
    otp: { code: string; generatedAt: number }
  ) => Promise<void> = async (email, otp) => {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      throw new Error(`User doesn't exist for given email`);
    }
    await prisma.user.update({
      where: {
        email,
      },
      data: {
        UserOtp: {
          create: {
            code: otp.code,
            generated_at: new Date(otp.generatedAt * 1000),
            is_used: false,
          },
        },
      },
    });
  };
}

export class ForgotPasswordHandler implements IForgotPasswordHandler {
  isOtpValid: (email: string, otp: string) => Promise<boolean> = async (
    email,
    otp
  ) => {
    const latestOtp = await prisma.userOtp.findFirst({
      where: {
        user: {
          email,
        },
      },
      orderBy: {
        created: "desc",
      },
    });

    if (!latestOtp) {
      console.error("latestOtp not found");
      return false;
    }

    const isExpired =
      Date.now() > latestOtp.generated_at.getTime() + 5 * 60 * 1000;

    return latestOtp.code === otp && !latestOtp.is_used && !isExpired;
  };

  saveNewPassword: (email: string, password: string) => Promise<void> = async (
    email,
    password
  ) => {
    await prisma.user.update({
      where: {
        email,
      },
      data: {
        password,
      },
    });
  };
}
