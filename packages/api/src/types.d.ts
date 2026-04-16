export interface AuthMiddlewareState {
  Variables: {
    user: DecodedToken;
    allowedReq: {
      token: TokenType;
      role: "ORG_ADMIN" | "ORG_USER" | "SPR_ADMIN";
    };
  };
}
export type TokenType = "sa_a_tk" | "a_a_tk" | "u_a_tk";

export interface DecodedToken {
  id: string;
  name: string;
  role: string;
}
