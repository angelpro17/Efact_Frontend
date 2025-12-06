import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginRequest, TokenResponse, User } from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly TOKEN_KEY = 'efact_token';
    private readonly USER_KEY = 'efact_user';
    private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());

    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    login(username: string, password: string): Observable<TokenResponse> {
        const url = `${environment.apiUrl}${environment.oauth.tokenUrl}`;

        const headers = new HttpHeaders({
            'Authorization': environment.oauth.clientAuth,
            'Content-Type': 'application/x-www-form-urlencoded'
        });

        const body = new URLSearchParams({
            'grant_type': 'password',
            'username': username,
            'password': password
        }).toString();

        return this.http.post<TokenResponse>(url, body, { headers }).pipe(
            tap(response => {
                this.setSession(response, username);
            })
        );
    }

    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    private setSession(authResult: TokenResponse, username: string): void {
        localStorage.setItem(this.TOKEN_KEY, authResult.access_token);

        const user: User = {
            username,
            token: authResult.access_token
        };

        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
    }

    private getUserFromStorage(): User | null {
        const userJson = localStorage.getItem(this.USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    }
}
