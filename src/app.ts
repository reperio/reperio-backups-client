import {Router, RouterConfiguration} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';
import {PLATFORM} from 'aurelia-pal';
import {autoinject} from 'aurelia-framework';

import {HttpClientConfig} from "./config/httpClientConfig"
import {AuthorizeRouterStep} from "./config/authorizeRouterStep"

import { AuthService } from "./services/authService";


@autoinject()
export class App {
    router: Router;

    constructor(private authService: AuthService, private httpClientConfig: HttpClientConfig, eventAggregator: EventAggregator) {
        httpClientConfig.configureHttpClient();
    }

    configureRouter(config: RouterConfiguration, router: Router) {
        config.title = 'Reperio Backups'; //TODO change this
        config.map([
            { route: ['', 'home'], name: 'home', moduleId: PLATFORM.moduleName('./components/home'), nav: true, title: 'Home', settings: {requireAuth: true}  },
            { route: 'login', name: 'login', moduleId: PLATFORM.moduleName('./components/auth/login'), nav: true, title: 'Login', settings: {requireNoAuth: true} },
            { route: 'jobs', name: 'jobs', moduleId: PLATFORM.moduleName('./components/jobs/jobView'), nav: true, title: 'Job List', settings: {requireAuth: true } },
            { route: 'history', name: 'history', moduleId: PLATFORM.moduleName('./components/history/historyView'), nav: true, title: 'History', settings: {requireAuth: true} },
            { route: 'vms', name: 'vms', moduleId: PLATFORM.moduleName('./components/virtual_machines/virtual_machines_view'), nav: true, title: 'Virtual Machines', settings: {requireAuth: true} }
         ]);

        config.addPipelineStep('authorize', AuthorizeRouterStep);
        this.router = router;

    }
}