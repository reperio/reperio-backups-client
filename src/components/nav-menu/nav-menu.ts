import {autoinject, bindable, bindingMode, computedFrom} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';
import {AuthService} from "../../services/authService";
import {User} from "../../models/user";

@autoinject
export class NavMenu {
    isLoggedIn: boolean = false;
    loggedInUser: User = null;

    constructor(private eventAggregator: EventAggregator, private authService: AuthService, private router: Router) {
        eventAggregator.subscribe("authStateChanged", () => this.authStateChanged());
        this.authStateChanged();
    }

    authStateChanged() {
        this.isLoggedIn = this.authService.isLoggedIn();
        this.loggedInUser = this.authService.getLoggedInUser();
    }

    logout() {
        this.authService.logout();
        this.router.navigateToRoute("login");
    }
}