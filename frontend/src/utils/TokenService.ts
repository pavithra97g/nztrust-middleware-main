class TokenService {
  private static tokenKey = "token";

  // Save the token to localStorage
  static setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Retrieve the token from localStorage
  static getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Remove the token from localStorage
  static removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // Check if the user is authenticated
  static isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

export default TokenService;
