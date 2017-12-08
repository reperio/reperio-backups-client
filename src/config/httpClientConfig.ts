import {autoinject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import environment from "../environment"

import {AuthService} from "../services/authService"

@autoinject()
export class HttpClientConfig {
    constructor(private http: HttpClient, private authService: AuthService) {}

    configureHttpClient() {
        this.http.configure(config => {
            config
                .withBaseUrl(environment.apiUrl)
                .withInterceptor({
                    request: (request) => this.handleRequest(request),
                    response: (response) => this.handleResponse(response)
                });
        });
    }

    handleRequest(request: Request): Request {
        const authToken = this.authService.getToken();
        if (authToken != null) {
            request.headers.set("authorization", authToken);
        }
        return request;
    }

    handleResponse(response: Response): Response {
        if (response.headers.has("authorization")) {
            const authToken = response.headers.get("authorization");
            this.authService.saveToken(authToken);
        }
        return response;
    }
}