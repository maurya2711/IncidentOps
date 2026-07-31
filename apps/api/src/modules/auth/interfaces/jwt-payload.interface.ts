export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  sessionId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
}
