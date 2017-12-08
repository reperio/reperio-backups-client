import {autoinject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {HttpClient, json} from 'aurelia-fetch-client';
import {Router} from 'aurelia-router';
import * as moment from "moment";

import {User} from "../models/user"

@autoinject()
export class AuthService {
    private loggedInUser: User = null;
    private currentUser: User = null;
    private isInitialized = false;
    private expirationDate: Date = null;

    constructor(private http: HttpClient, private eventAggregator: EventAggregator, private router: Router) { }

    parseJwt(token: string): any {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace('-', '+').replace('_', '/');

        return JSON.parse(window.atob(base64));
    }

    saveToken(token: string) {
        const oldLoggedInUser = this.getLoggedInUser();
        const oldCurrentUser = this.getCurrentUser();
        const oldLoggedInUserId = oldLoggedInUser == null ? null : oldLoggedInUser.id;
        const oldCurrentUserId = oldCurrentUser == null ? null : oldCurrentUser.id;

        window.localStorage.setItem("jwtToken", token);
        this.loadToken();

        const newLoggedInUser = this.getLoggedInUser();
        const newCurrentUser = this.getCurrentUser();
        const newLoggedInUserId = newLoggedInUser == null ? null : newLoggedInUser.id;
        const newCurrentUserId = newCurrentUser == null ? null : newCurrentUser.id;


        const everythingIsNull = oldLoggedInUserId == null && oldCurrentUserId == null &&
            newLoggedInUserId == null && newCurrentUserId == null;

        if (!everythingIsNull && (oldLoggedInUserId !== newLoggedInUserId || oldCurrentUserId !== newCurrentUserId)) {
            this.router.navigateToRoute("home");
        }
    }

    getToken(): string {
        return window.localStorage.getItem("jwtToken");
    }

    isLoggedIn(): boolean {
        return this.getLoggedInUser() != null;
    }

    getLoggedInUser(): User {
        this.ensureTokenLoaded();
        return this.loggedInUser;
    }

    getCurrentUser(): User {
        this.ensureTokenLoaded();
        return this.currentUser;
    }

    logout() {
        window.localStorage.removeItem("jwtToken");
        this.loadToken();
    }

    ensureTokenLoaded(): void {
        if (!this.isInitialized) {
            this.loadToken();
        }
    }

    private loadToken(): void {
        this.isInitialized = true;
        const token = this.getToken();
        const parsedToken = token == null ? null : this.parseJwt(token);
        if (parsedToken != null && Math.round((new Date()).getTime() / 1000) < parsedToken.exp) {
            this.loggedInUser = parsedToken.loggedInUser;
            this.currentUser = parsedToken.currentUser;
            this.expirationDate = moment(parsedToken.exp * 1000).toDate();
            this.eventAggregator.publish("authStateChanged");
        } else {
            this.loggedInUser = null;
            this.currentUser = null;
            this.expirationDate = null;
            this.eventAggregator.publish("authStateChanged");
        }
    }

    async login(email: string, password: string): Promise<any> {
        const postObject = {email, password};

        const response = {
            status: 200
        };

        return response;

        /*return await this.http.fetch("auth", {
            method: "post",
            body: json(postObject)
        }); */
    }
}