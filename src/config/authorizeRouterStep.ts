import {Redirect} from 'aurelia-router';
import {autoinject} from 'aurelia-framework';

import {AuthService} from "../services/authService";


@autoinject()
export class AuthorizeRouterStep {

    constructor(private authService: AuthService) {}

    run(navigationInstruction, next) {
        let isLoggedIn = this.authService.isLoggedIn();

        // currently active route config
        let currentRoute = navigationInstruction.config;

        // settings object will be preserved during navigation
        let requireAuth = currentRoute.settings && currentRoute.settings.requireAuth;
        let requireNoAuth = currentRoute.settings && currentRoute.settings.requireNoAuth;

        if (!isLoggedIn && requireAuth) {
            return next.cancel(new Redirect('login'));
        } else if (isLoggedIn && requireNoAuth) {
            return next.cancel(new Redirect('login'));
        }

        return next();
    }

}