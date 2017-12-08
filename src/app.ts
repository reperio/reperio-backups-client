import {Router, RouterConfiguration} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';
import {PLATFORM} from 'aurelia-pal';
import {autoinject} from 'aurelia-framework';

import {HttpClientConfig} from "./config/httpClientConfig"
import {AuthorizeRouterStep} from "./config/authorizeRouterStep"

@autoinject()
export class App {
    router: Router;

    constructor(private httpClientConfig: HttpClientConfig, eventAggregator: EventAggregator) {
        httpClientConfig.configureHttpClient();
    }

    configureRouter(config: RouterConfiguration, router: Router) {
        config.title = 'Reperio Backups'; //TODO change this
        config.map([
            { route: ['', 'home'], name: 'home', moduleId: PLATFORM.moduleName('./components/home'), nav: true, title: 'Home', settings: {requireAuth: true}  },
            { route: 'login', name: 'login', moduleId: PLATFORM.moduleName('./components/auth/login'), nav: true, title: 'Login', settings: {requireNoAuth: true} },
        ]);

        config.addPipelineStep('authorize', AuthorizeRouterStep);
        this.router = router;

    }
}